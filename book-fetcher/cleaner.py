import pandas as pd

input_file = "genre.csv"      # Path to your CSV file
output_file = "genre.csv"   # Path to save the cleaned CSV
primary_key_column = "genreid"     # Column to use as primary key

df = pd.read_csv(input_file)

df_cleaned = df.drop_duplicates(subset=primary_key_column, keep='first')
df_cleaned.to_csv(output_file, index=False)
print(f"Duplicates removed based on '{primary_key_column}'. Cleaned file saved to '{output_file}'.")