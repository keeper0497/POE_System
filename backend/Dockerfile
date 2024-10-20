# Use an official PostGIS image as the base
FROM postgis/postgis:14-3.2

# Install system dependencies for GDAL, GEOS, PROJ, and PostgreSQL client
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
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
ENV GDAL_LIBRARY_PATH=/usr/lib/libgdal.so.28
ENV GEOS_LIBRARY_PATH=/usr/lib/libgeos_c.so

# Set the environment variable for the database URL
ENV DATABASE_URL=postgresql://peo_admin:4EbjUZ7abHHYzghDjddeViJxkrTI0GuC@dpg-cs77ouaj1k6c73cldpvg-a:5432/peo_vi7s

# Environment variables for superuser
ENV DJANGO_SUPERUSER_USERNAME=admin
ENV DJANGO_SUPERUSER_PASSWORD=adminpass
ENV DJANGO_SUPERUSER_EMAIL=admin01@yopmail.com


# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt . 
RUN pip3 install -r requirements.txt

# Test PostgreSQL connection (Optional)
RUN psql postgresql://peo_admin:4EbjUZ7abHHYzghDjddeViJxkrTI0GuC@dpg-cs77ouaj1k6c73cldpvg-a:5432/peo_vi7s -c '\l' || echo "Postgres connection failed"

# Copy the rest of the project files
COPY . .

# Run Django management commands
RUN python3 manage.py collectstatic --noinput
RUN python3 manage.py makemigrations
RUN python3 manage.py migrate

# Create a superuser non-interactively
# RUN python3 manage.py createsuperuser --noinput || echo "Superuser already created"

# Expose port 8000 and run the app
EXPOSE 8000
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
