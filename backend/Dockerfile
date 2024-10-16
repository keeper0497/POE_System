# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Install system dependencies for GDAL, GEOS, PROJ, and PostgreSQL client
RUN apt-get update && apt-get install -y \
    binutils \
    libproj-dev \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libgeos-c1v5 \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Check GDAL installation path
RUN ldconfig -p | grep gdal

# Set environment variables for GeoDjango with a verified path
ENV GDAL_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgdal.so
ENV GEOS_LIBRARY_PATH=/usr/lib/libgeos_c.so

# Set the environment variable for the database URL
ENV DATABASE_URL=postgresql://peo_admin:4EbjUZ7abHHYzghDjddeViJxkrTI0GuC@dpg-cs77ouaj1k6c73cldpvg-a:5432/peo_vi7s

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt . 
RUN pip install -r requirements.txt

# Test PostgreSQL connection (Optional)
RUN psql postgresql://peo_admin:4EbjUZ7abHHYzghDjddeViJxkrTI0GuC@dpg-cs77ouaj1k6c73cldpvg-a:5432/peo_vi7s -c '\l' || echo "Postgres connection failed"

# Copy the rest of the project files
COPY . .

# Run Django management commands
RUN python manage.py collectstatic --noinput
RUN python manage.py makemigrations
RUN python manage.py migrate

# Expose port 8000 and run the app
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
