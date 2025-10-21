import pandas as pd
import random

# List of districts in Uttar Pradesh
districts = [
    "Agra","Aligarh","Allahabad","Ambedkar Nagar","Amethi","Amroha","Auraiya","Ayodhya",
    "Azamgarh","Baghpat","Bahraich","Ballia","Balrampur","Banda","Barabanki","Bareilly",
    "Basti","Bhadohi","Bijnor","Budaun","Bulandshahr","Chandauli","Chitrakoot","Deoria",
    "Etah","Etawah","Farrukhabad","Fatehpur","Firozabad","Gautam Buddha Nagar","Ghaziabad",
    "Ghazipur","Gonda","Gorakhpur","Hamirpur","Hapur","Hardoi","Hathras","Jalaun","Jaunpur",
    "Jhansi","Kannauj","Kanpur Dehat","Kanpur Nagar","Kasganj","Kaushambi","Kushinagar",
    "Lakhimpur Kheri","Lalitpur","Lucknow","Maharajganj","Mahoba","Mainpuri","Mathura","Mau",
    "Meerut","Mirzapur","Moradabad","Muzaffarnagar","Pilibhit","Pratapgarh","Raebareli",
    "Rampur","Saharanpur","Sambhal","Sant Kabir Nagar","Shahjahanpur","Shamli","Shravasti",
    "Siddharthnagar","Sitapur","Sonbhadra","Sultanpur","Unnao","Varanasi"
]

# Financial years
financial_years = ["2020-2021", "2021-2022", "2022-2023", "2023-2024", "2024-2025", "2025-2026"]

# Months
months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

# List to hold all rows
data = []

# Generate synthetic data
for year_idx, fy in enumerate(financial_years, start=2020):
    for month in months:
        for district_idx, district in enumerate(districts, start=1):
            row = {
                "fin_year": fy,
                "month": month,
                "state_code": 9,
                "state_name": "Uttar Pradesh",
                "district_code": district_idx,
                "district_name": district,
                "approved_labour_budget": random.randint(400000, 2500000),
                "avg_wage_rate_per_day_per_person": round(random.uniform(200, 250), 2),
                "avg_days_of_employment_per_household": random.randint(30, 50),
                "differently_abled_persons_worked": random.randint(0, 600),
                "material_and_skilled_wages": round(random.uniform(50, 2000),2),
                "num_completed_works": random.randint(500, 15000),
                "num_gps_with_nil_exp": random.randint(0, 500),
                "num_ongoing_works": random.randint(1000, 20000),
                "persondays_of_central_liability_so_far": random.randint(50000, 2500000),
                "sc_persondays": random.randint(1000, 50000),
                "sc_workers_against_active_workers": random.randint(100, 5000),
                "st_persondays": random.randint(0, 2000),
                "st_workers_against_active_workers": random.randint(0, 500),
                "total_admin_expenditure": round(random.uniform(50, 500),2),
                "total_expenditure": round(random.uniform(500, 3000),2),
                "total_households_worked": random.randint(1000, 100000),
                "total_individuals_worked": random.randint(1000, 150000),
                "total_active_job_cards": random.randint(10000, 150000),
                "total_active_workers": random.randint(10000, 200000),
                "total_hhs_completed_100_days": random.randint(0, 1000),
                "total_job_cards_issued": random.randint(10000, 200000),
                "total_workers": random.randint(10000, 200000),
                "total_works_takenup": random.randint(500, 20000),
                "wages": round(random.uniform(500, 2000),2),
                "women_persondays": random.randint(1000, 200000),
                "percent_category_b_works": round(random.uniform(0,100),2),
                "percent_expenditure_agri_allied": round(random.uniform(0,100),2),
                "percent_nrm_expenditure": round(random.uniform(0,100),2),
                "percent_payments_within_15_days": round(random.uniform(90,100),2),
                "remarks": "NA",
                "payload": "{}"
            }
            data.append(row)

# Create DataFrame
df = pd.DataFrame(data)

# Save as CSV
df.to_csv("mgnrega_up_2020_2026.csv", index=False)

print("CSV file generated successfully!")
