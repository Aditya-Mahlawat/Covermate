from dotenv import load_dotenv
import os

# load environment variables from .env file
load_dotenv()

# read database url
DATABASE_URL = os.getenv("DATABASE_URL")
