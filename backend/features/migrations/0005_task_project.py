# Generated by Django 5.1 on 2024-09-23 14:39

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('features', '0004_task'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='project',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, to='features.project'),
            preserve_default=False,
        ),
    ]
