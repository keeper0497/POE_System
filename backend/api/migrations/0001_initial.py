# Generated by Django 5.1 on 2024-09-07 14:59

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('position', models.CharField(max_length=2500)),
                ('division', models.CharField(max_length=2500)),
                ('start_date', models.DateField()),
                ('num_sickleave', models.IntegerField()),
                ('num_vacationleave', models.IntegerField()),
                ('contact_number', models.CharField(max_length=250, null=True, unique=True)),
                ('custom_user_id', models.CharField(max_length=250, unique=True)),
                ('first_name', models.CharField(max_length=2500)),
                ('last_name', models.CharField(max_length=2500)),
                ('middle_name', models.CharField(max_length=2500)),
                ('suffix', models.CharField(blank=True, max_length=500, null=True)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
