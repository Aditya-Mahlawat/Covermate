"""
Seed Script – Populate the database with sample providers and policies.

Expanded for Module B: 4+ policies per type (health, life, auto, home, travel)
across 5 providers.

Run this AFTER the server has been started at least once (so the tables
exist), or call  Base.metadata.create_all()  here before seeding.

Usage:
    cd covermate-backend
    python seed.py
"""

from app.database import SessionLocal, engine, Base
from app.models import Provider, Policy

# Ensure tables exist
Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        # ── Check if data already exists ──
        if db.query(Provider).count() > 0:
            print("⚠️  Database already has providers – skipping seed.")
            return

        # ━━━━━━━━━━ PROVIDERS ━━━━━━━━━━
        providers = [
            Provider(name="LIC of India", country="India"),
            Provider(name="HDFC Ergo", country="India"),
            Provider(name="ICICI Lombard", country="India"),
            Provider(name="Star Health", country="India"),
            Provider(name="Bajaj Allianz", country="India"),
        ]
        db.add_all(providers)
        db.flush()   # assigns IDs without committing

        lic, hdfc, icici, star, bajaj = providers

        # ━━━━━━━━━━ POLICIES ━━━━━━━━━━

        policies = [

            # ─────────────── LIFE INSURANCE (4 policies) ───────────────
            Policy(
                provider_id=lic.id,
                policy_type="life",
                title="LIC Jeevan Anand",
                coverage={
                    "death_benefit": "10,00,000",
                    "maturity_benefit": "10,00,000",
                    "bonus": "yearly",
                    "loan_facility": True,
                },
                premium=5000,
                term_months=240,   # 20 years
                deductible=0,
                tnc_url="https://licindia.in/jeevan-anand-tnc",
            ),
            Policy(
                provider_id=lic.id,
                policy_type="life",
                title="LIC Tech Term",
                coverage={
                    "death_benefit": "1,00,00,000",
                    "maturity_benefit": "None (pure term)",
                    "accidental_death_rider": True,
                    "online_purchase": True,
                },
                premium=1200,
                term_months=360,   # 30 years
                deductible=0,
                tnc_url="https://licindia.in/tech-term-tnc",
            ),
            Policy(
                provider_id=hdfc.id,
                policy_type="life",
                title="HDFC Life Click 2 Protect",
                coverage={
                    "death_benefit": "50,00,000",
                    "terminal_illness": True,
                    "waiver_of_premium": True,
                    "return_of_premium": "optional",
                },
                premium=2500,
                term_months=300,   # 25 years
                deductible=0,
                tnc_url="https://hdfclife.com/click2protect-tnc",
            ),
            Policy(
                provider_id=bajaj.id,
                policy_type="life",
                title="Bajaj Allianz Smart Protect Goal",
                coverage={
                    "death_benefit": "25,00,000",
                    "critical_illness_rider": True,
                    "accidental_disability": True,
                    "flexible_payout": "lump sum or monthly",
                },
                premium=1800,
                term_months=240,
                deductible=0,
                tnc_url="https://bajajallianz.com/smart-protect-tnc",
            ),

            # ─────────────── HEALTH INSURANCE (4 policies) ───────────────
            Policy(
                provider_id=hdfc.id,
                policy_type="health",
                title="HDFC Ergo Optima Secure",
                coverage={
                    "sum_insured": "5,00,000",
                    "room_rent": "no_cap",
                    "pre_hospitalization": "30_days",
                    "post_hospitalization": "60_days",
                    "daycare_procedures": True,
                },
                premium=8500,
                term_months=12,
                deductible=5000,
                tnc_url="https://hdfcergo.com/optima-secure-tnc",
            ),
            Policy(
                provider_id=lic.id,
                policy_type="health",
                title="LIC Cancer Cover",
                coverage={
                    "sum_insured": "10,00,000",
                    "early_stage": "25%",
                    "major_stage": "100%",
                    "income_benefit": "1% monthly for 5 years",
                },
                premium=2000,
                term_months=12,
                deductible=0,
                tnc_url="https://licindia.in/cancer-cover-tnc",
            ),
            Policy(
                provider_id=star.id,
                policy_type="health",
                title="Star Health Comprehensive",
                coverage={
                    "sum_insured": "10,00,000",
                    "room_rent": "single_ac_room",
                    "maternity_benefit": True,
                    "new_born_cover": True,
                    "organ_donor": True,
                    "ayush_treatment": True,
                },
                premium=12000,
                term_months=12,
                deductible=3000,
                tnc_url="https://starhealth.in/comprehensive-tnc",
            ),
            Policy(
                provider_id=bajaj.id,
                policy_type="health",
                title="Bajaj Allianz Health Guard",
                coverage={
                    "sum_insured": "3,00,000",
                    "room_rent": "1% of sum insured",
                    "pre_hospitalization": "60_days",
                    "post_hospitalization": "90_days",
                    "ambulance_cover": "2,000",
                },
                premium=5500,
                term_months=12,
                deductible=2000,
                tnc_url="https://bajajallianz.com/health-guard-tnc",
            ),

            # ─────────────── AUTO INSURANCE (4 policies) ───────────────
            Policy(
                provider_id=icici.id,
                policy_type="auto",
                title="ICICI Lombard Car Insurance",
                coverage={
                    "own_damage": "IDV based",
                    "third_party": "unlimited",
                    "personal_accident": "15,00,000",
                    "roadside_assistance": True,
                },
                premium=12000,
                term_months=12,
                deductible=2500,
                tnc_url="https://icicilombard.com/car-insurance-tnc",
            ),
            Policy(
                provider_id=hdfc.id,
                policy_type="auto",
                title="HDFC Ergo Motor Insurance",
                coverage={
                    "own_damage": "IDV based",
                    "third_party": "unlimited",
                    "zero_depreciation": True,
                    "engine_protection": True,
                    "key_replacement": True,
                },
                premium=15000,
                term_months=12,
                deductible=1000,
                tnc_url="https://hdfcergo.com/motor-tnc",
            ),
            Policy(
                provider_id=bajaj.id,
                policy_type="auto",
                title="Bajaj Allianz Two Wheeler Insurance",
                coverage={
                    "own_damage": "IDV based",
                    "third_party": "unlimited",
                    "personal_accident": "1,00,000",
                    "roadside_assistance": True,
                },
                premium=3500,
                term_months=12,
                deductible=500,
                tnc_url="https://bajajallianz.com/two-wheeler-tnc",
            ),
            Policy(
                provider_id=star.id,
                policy_type="auto",
                title="Star Health Commercial Vehicle Cover",
                coverage={
                    "own_damage": "IDV based",
                    "third_party": "unlimited",
                    "goods_in_transit": "5,00,000",
                    "driver_cover": "2,00,000",
                },
                premium=22000,
                term_months=12,
                deductible=5000,
                tnc_url="https://starhealth.in/commercial-vehicle-tnc",
            ),

            # ─────────────── HOME INSURANCE (4 policies) ───────────────
            Policy(
                provider_id=hdfc.id,
                policy_type="home",
                title="HDFC Ergo Home Shield",
                coverage={
                    "structure": "50,00,000",
                    "contents": "10,00,000",
                    "natural_disaster": True,
                    "theft": True,
                },
                premium=3500,
                term_months=12,
                deductible=1000,
                tnc_url="https://hdfcergo.com/home-shield-tnc",
            ),
            Policy(
                provider_id=bajaj.id,
                policy_type="home",
                title="Bajaj Allianz Home Insurance",
                coverage={
                    "structure": "30,00,000",
                    "contents": "5,00,000",
                    "fire_damage": True,
                    "flood_damage": True,
                    "burglary": True,
                },
                premium=2800,
                term_months=12,
                deductible=500,
                tnc_url="https://bajajallianz.com/home-insurance-tnc",
            ),
            Policy(
                provider_id=icici.id,
                policy_type="home",
                title="ICICI Lombard Home Protect",
                coverage={
                    "structure": "1,00,00,000",
                    "contents": "20,00,000",
                    "earthquake": True,
                    "terrorism": True,
                    "rent_for_alternate_accommodation": "50,000",
                },
                premium=6000,
                term_months=12,
                deductible=2000,
                tnc_url="https://icicilombard.com/home-protect-tnc",
            ),
            Policy(
                provider_id=star.id,
                policy_type="home",
                title="Star Home Secure Plus",
                coverage={
                    "structure": "75,00,000",
                    "contents": "15,00,000",
                    "jewellery": "2,00,000",
                    "electronic_equipment": "3,00,000",
                    "public_liability": True,
                },
                premium=4500,
                term_months=12,
                deductible=1500,
                tnc_url="https://starhealth.in/home-secure-tnc",
            ),

            # ─────────────── TRAVEL INSURANCE (4 policies) ───────────────
            Policy(
                provider_id=icici.id,
                policy_type="travel",
                title="ICICI Lombard Travel Safe",
                coverage={
                    "medical_emergency": "5,00,000",
                    "trip_cancellation": "1,00,000",
                    "baggage_loss": "50,000",
                    "flight_delay": "10,000",
                },
                premium=1500,
                term_months=1,
                deductible=500,
                tnc_url="https://icicilombard.com/travel-safe-tnc",
            ),
            Policy(
                provider_id=bajaj.id,
                policy_type="travel",
                title="Bajaj Allianz Travel Elite",
                coverage={
                    "medical_emergency": "15,00,000",
                    "trip_cancellation": "3,00,000",
                    "baggage_loss": "1,00,000",
                    "passport_loss": "25,000",
                    "hijack_distress": "10,000",
                },
                premium=3500,
                term_months=1,
                deductible=1000,
                tnc_url="https://bajajallianz.com/travel-elite-tnc",
            ),
            Policy(
                provider_id=hdfc.id,
                policy_type="travel",
                title="HDFC Ergo Travel Wallet",
                coverage={
                    "medical_emergency": "7,50,000",
                    "trip_cancellation": "2,00,000",
                    "baggage_delay": "15,000",
                    "missed_connection": "20,000",
                    "adventure_sports": True,
                },
                premium=2200,
                term_months=1,
                deductible=750,
                tnc_url="https://hdfcergo.com/travel-wallet-tnc",
            ),
            Policy(
                provider_id=star.id,
                policy_type="travel",
                title="Star Travel Protect Gold",
                coverage={
                    "medical_emergency": "10,00,000",
                    "trip_cancellation": "2,50,000",
                    "baggage_loss": "75,000",
                    "home_burglary_during_travel": "1,00,000",
                    "emergency_evacuation": True,
                },
                premium=2800,
                term_months=1,
                deductible=500,
                tnc_url="https://starhealth.in/travel-protect-tnc",
            ),
        ]

        db.add_all(policies)
        db.commit()

        print(f"✅  Seeded {len(providers)} providers and {len(policies)} policies.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
