import random
from datetime import datetime, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from api.models import Well, WellProduction

class Command(BaseCommand):
    help = "Seeds the database with realistic oil well production data"

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=365, help='Number of days of data')
        parser.add_argument('--wells', type=int, default=5, help='Number of wells to create')

    def handle(self, *args, **options):
        num_days = options['days']
        num_wells = options['wells']
        start_date = datetime.now().date() - timedelta(days=num_days)

        self.stdout.write(self.style.SUCCESS(f"🌱 Seeding data for {num_wells} wells over {num_days} days..."))

        well_names = ["TFT-302", "HMD-011", "MD-201", "TFT-405", "B-09"]
        
        for i in range(num_wells):
            name = well_names[i] if i < len(well_names) else f"WELL-{100 + i}"
            well, created = Well.objects.get_or_create(
                uwi=f"UWI-{1000 + i}",
                defaults={
                    'name': name,
                    'well_type': random.choice(['OIL', 'GAS']),
                    'latitude': Decimal(random.uniform(28.0, 32.0)),
                    'longitude': Decimal(random.uniform(5.0, 9.0)),
                    'total_depth': Decimal(random.uniform(2500, 4500)),
                    'spud_date': start_date - timedelta(days=1000)
                }
            )

            # Generate Time-Series Data
            production_records = []
            # Base values to simulate a "starting point" for the well
            base_whp = random.uniform(1400, 1600)
            base_w_gas = random.uniform(5000, 7000)

            for d in range(num_days):
                current_date = start_date + timedelta(days=d)
                
                # Add small daily fluctuations + a 1% monthly decline
                fluctuation = random.uniform(-0.02, 0.02)
                decline = (1 - 0.001)**d 
                
                current_whp = base_whp * decline * (1 + fluctuation)
                current_gas = base_w_gas * decline * (1 + fluctuation)

                record = WellProduction(
                    well=well,
                    date=current_date,
                    hours=Decimal(random.uniform(23.0, 24.0)),
                    whp=Decimal(current_whp),
                    wht=Decimal(random.uniform(170, 190)),
                    wlp=Decimal(random.uniform(400, 500)),
                    h2o=Decimal(random.uniform(0.5, 5.0)),
                    water=Decimal(random.uniform(10, 50)),
                    prodindex=Decimal(random.uniform(0.7, 1.2)),
                    # Targets
                    w_gas=Decimal(current_gas),
                    s_gas=Decimal(current_gas * 0.23),
                    lpg_mass=Decimal(current_gas * 0.008),
                    lpg_vol=Decimal(current_gas * 0.015),
                    cond_vol=Decimal(current_gas * 0.05),
                    cond_mass=Decimal(current_gas * 0.04),
                    # NGLs
                    c2m=Decimal(random.uniform(10, 15)),
                    c3=Decimal(random.uniform(7, 10)),
                    c4=Decimal(random.uniform(4, 6)),
                    c5p=Decimal(random.uniform(2, 4)),
                    tag=random.choice([True, False])
                )
                production_records.append(record)

            # Bulk create is significantly faster (good for DevOps efficiency)
            WellProduction.objects.bulk_create(
                production_records, 
                ignore_conflicts=True # Skips duplicates if run twice
            )
            self.stdout.write(f"Done seeding {well.name}")

        self.stdout.write(self.style.SUCCESS("✅ Seeding completed successfully."))