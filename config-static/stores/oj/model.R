## User inputs disease
A0_importations_per_day <- user(10, min = 0) # Constant total importation rate across all groups
A1_R0 <- user(2.5, min = 0)  # Basic reproduction number (A1_R0)
A2_incubation_days <- user(3, min = 0) # Incubation period in days
A3_incubation_prop_infectious <- user(0.1, min = 0.01, max = 0.99)
A4_prop_symptomatic <- user(0.7, min = 0, max = 1)  # Probability of developing symptoms
A5_symptomatic_days <- user(7, min = 0)

A6_IFR_age_under_18 <- user(0.0001, min = 0, max = 0.2) # capped at HFR 
A7_IFR_age_18_65 <- user(0.001, min = 0, max = 0.2) # capped at HFR
A8_IFR_age_over_65 <- user(0.05, min = 0, max = 0.2) # capped at HFR


# User-defined NPI parameters 
B0_npi_delay_after_first_hospitalisation <- user(14, min = 0)

# NPI parameters for transmission reductions (default is 0, meaning no reduction)
B1_reduction_in_transmission_among_contacts <- user(0, min = 0, max = 1)
B2a_reduction_in_contacts_under_18 <- user(0, min = 0, max = 1)  # NPI efficacy for school-age
B2b_reduction_in_contacts_18_65 <- user(0, min = 0, max = 1)  # NPI efficacy for working-age
B2c_reduction_in_contacts_over_65 <- user(0, min = 0, max = 1)  # NPI efficacy for retired-age

# NPI parameters for isolation and testing reductions (set to 0 by default)
B3a_proportion_isolating_after_symptoms <- user(0, min = 0, max = 1)  # Reduction in infectiousness after symptoms
B3b_proportion_isolating_after_testing_positive <- 0  # Reduction in infectiousness after testing - not currently used

# NPI parameters for importation (set to 0 by default)
B4_reduction_in_importations <- user(0, min = 0, max = 1)  # NPI efficacy for reducing importations


# Convert user params to model params
p_S <- A4_prop_symptomatic
p_I_E <- min(A3_incubation_prop_infectious, 0.9999)
npi_t <- B1_reduction_in_transmission_among_contacts
npi_c01 <- B2a_reduction_in_contacts_under_18
npi_c02 <-B2b_reduction_in_contacts_18_65
npi_c03 <- B2c_reduction_in_contacts_over_65


# Infection progression (IHR is the probability of going to the severe compartment I_H)

IFR01 <- A6_IFR_age_under_18
IFR02 <- A7_IFR_age_18_65
IFR03 <- A8_IFR_age_over_65

HFR <- 0.2  # 20% of those hospitalised die - medical care

IHR01 <- IFR01 / HFR  # Infection Hospitalisation Rate for age group 01
IHR02 <- IFR02 / HFR  # Infection Hospitalisation Rate for age group 02
IHR03 <- IFR03 / HFR  # Infection Hospitalisation Rate for age group 03




# Compartment-specific durations calculated from durations
dur_E <- (1 - p_I_E) * A2_incubation_days # duration in E compartment
dur_I_E <- A2_incubation_days - dur_E
dur_I_A <- A5_symptomatic_days  # assume same as symptoms
dur_I_M <- A5_symptomatic_days  # assume same as symptoms
dur_I_H <- A5_symptomatic_days  # assume same as symptoms
dur_H <- 14  # duration in H compartment (hospitalized) - assume 2 weeks
dur_T <- A5_symptomatic_days  # Duration in T compartment (tested)

t_npi <- dur_I_E + dur_E + dur_I_H + B0_npi_delay_after_first_hospitalisation

rate_E <- 1 / dur_E  # Rate out of non-infectious exposed compartment
rate_I_E <- 1 / dur_I_E  # Rate out of presymptomatic infectious compartment
rate_I_A <- 1 / dur_I_A  # rate from I_A to R (recovery for asymptomatic)
rate_I_M <- 1 / dur_I_M  # rate from I_M to R
rate_I_H <- 1 / dur_I_H  # rate from I_H to H
rate_H <- 1 / dur_H  # rate from H to R/D
rate_T <- 1 / dur_T  # rate from T to R (for tested individuals)

# Define the total UK population size
N <- 69e6  # Approximate total UK population (69 million)

# Proportion of population in each age group (approximate)
school_age_proportion <- 0.23  # School-age (0-19 years)
working_age_proportion <- 0.57  # Working-age (20-64 years)
retired_age_proportion <- 0.20  # Retired (65+ years)

# Split the population into three age groups based on the proportions
N01 <- N * school_age_proportion  # School-age population
N02 <- N * working_age_proportion  # Working-age population
N03 <- N * retired_age_proportion  # Retired-age population


# Total force of infection from all compartments
I01 <- I_E01 + I_M01 * npi_symptoms + I_H01 + I_A01 + T01 * npi_testing
I02 <- I_E02 + I_M02 * npi_symptoms + I_H02 + I_A02 + T02 * npi_testing
I03 <- I_E03 + I_M03 * npi_symptoms + I_H03 + I_A03 + T03 * npi_testing
I_total <- I01 + I02 + I03



# Apply NPIs based on the time
npi_transmission01 <- if (t < t_npi) 1 else 1 - npi_c01
npi_transmission02 <- if (t < t_npi) 1 else 1 - npi_c02
npi_transmission03 <- if (t < t_npi) 1 else 1 - npi_c03
npi_symptoms <- if (t < t_npi) 1 else 1 - B3a_proportion_isolating_after_symptoms   # Reduction in infectiousness after symptoms
npi_testing  <- if (t < t_npi) 1 else 1 - B3b_proportion_isolating_after_testing_positive   # Reduction in infectiousness after testing

# Importation inputs
npi_importation <- if (t < t_npi) 1 else 1 - B4_reduction_in_importations # Reduction in importations after NPIs

# Split the importation rate proportionally by population sizes
importations01 <- npi_importation * A0_importations_per_day * (N01 / N)
importations02 <- npi_importation * A0_importations_per_day * (N02 / N)
importations03 <- npi_importation * A0_importations_per_day * (N03 / N)


# Calculate infectious period calculation for each age group
infectious_period01 <- dur_I_E + (1 - p_S) * dur_I_A + p_S * ((1 - IHR01) * dur_I_M + IHR01 * dur_I_H)
infectious_period02 <- dur_I_E + (1 - p_S) * dur_I_A + p_S * ((1 - IHR02) * dur_I_M + IHR02 * dur_I_H)
infectious_period03 <- dur_I_E + (1 - p_S) * dur_I_A + p_S * ((1 - IHR03) * dur_I_M + IHR03 * dur_I_H)

# Calculate the weighted average infectious period across all age groups
infectious_period <- (N01 * infectious_period01 +
                        N02 * infectious_period02 +
                        N03 * infectious_period03) / N
# Calculate beta from R0 using the weighted average infectious period
beta <- A1_R0 / infectious_period
beta_t <- if (t > t_npi) beta * (1-npi_t) else beta

# Homogeneous mixing for each age group with proportional contact
S_I1_after_NPIs <- I01 * npi_transmission01 + I02 * min(npi_transmission02, npi_transmission01) + I03 * min(npi_transmission03, npi_transmission01)
S_I2_after_NPIs <- I01 * min(npi_transmission01, npi_transmission02) + I02 * npi_transmission02 + I03 * min(npi_transmission03, npi_transmission02)
S_I3_after_NPIs <- I01 * min(npi_transmission01, npi_transmission03) + I02 * min(npi_transmission02, npi_transmission03) + I03 * npi_transmission03

foi01 <-  beta_t * S_I1_after_NPIs / N
foi02 <-  beta_t * S_I2_after_NPIs / N
foi03 <-  beta_t * S_I3_after_NPIs / N

# New infections considering both imported and locally acquired, ensuring not to exceed susceptibles
new_infections01 <- min(S01, foi01 * S01 + importations01)
new_infections02 <- min(S02, foi02 * S02 + importations02)
new_infections03 <- min(S03, foi03 * S03 + importations03)

# New hospitalisations
new_hospitalisations01 <- rate_I_H * I_H01
new_hospitalisations02 <- rate_I_H * I_H02
new_hospitalisations03 <- rate_I_H * I_H03

# New deaths
new_deaths01 <- rate_H * HFR * H01
new_deaths02 <- rate_H * HFR * H02
new_deaths03 <- rate_H * HFR * H03

# Testing frequency input
testing_rate <- 0  # Rate of testing individuals per day

# Daily outputs
daily_infections <- new_infections01 + new_infections02 + new_infections03
daily_hospital_admissions <- new_hospitalisations01 + new_hospitalisations02 +new_hospitalisations03
daily_deaths <- new_deaths01 +  new_deaths02 +  new_deaths03
output(daily_infections) <- TRUE
output(daily_importations) <- importations01 + importations02 + importations03
output(daily_hospital_admissions) <- TRUE
output(daily_deaths) <- TRUE

# Cumulative_outputs - put these first to improve colour range on graphs for outputs of interest
deriv(total_infections) <- daily_infections
deriv(total_hospital_admissions) <- daily_hospital_admissions
deriv(total_deaths) <- daily_deaths
initial(total_infections) <- 0
initial(total_hospital_admissions) <- 0
initial(total_deaths) <- 0


# Compartment flow (from exposed to presymptomatic and further compartments)
deriv(S01) <- -new_infections01
deriv(E01) <- new_infections01 - rate_E * E01  # Non-infectious exposed
deriv(I_E01) <- rate_E * E01 - rate_I_E * I_E01  # Presymptomatic infectious
deriv(I_A01) <- (1 - p_S) * rate_I_E * I_E01 - rate_I_A * I_A01  # Asymptomatic infectious
deriv(I_M01) <- p_S * (1 - IHR01) * rate_I_E * I_E01 - rate_I_M * I_M01  # Symptomatic mild (infectious)
deriv(I_H01) <- p_S * IHR01 * rate_I_E * I_E01 - new_hospitalisations01  # Symptomatic severe (infectious)
deriv(H01) <- new_hospitalisations01 - rate_H * H01  # Hospitalized (not infectious)
deriv(T01) <- testing_rate * I_A01 - rate_T * T01  # Tested and isolated
deriv(R01) <- rate_I_A * I_A01 + rate_I_M * I_M01 + rate_T * T01 + (1 - HFR) * rate_H * H01  # Recovered
deriv(D01) <- new_deaths01  # Deaths


# Initial conditions for age group 01 (school-age, no seeding with infections)
initial(S01) <- N01
initial(E01) <- 0
initial(I_E01) <- 0
initial(I_A01) <- 0
initial(I_M01) <- 0
initial(I_H01) <- 0
initial(H01) <- 0
initial(T01) <- 0
initial(R01) <- 0
initial(D01) <- 0

# Compartment flow (from exposed to presymptomatic and further compartments)
deriv(S02) <- -new_infections02
deriv(E02) <- new_infections02 - rate_E * E02  # Non-infectious exposed
deriv(I_E02) <- rate_E * E02 - rate_I_E * I_E02  # Presymptomatic infectious
deriv(I_A02) <- (1 - p_S) * rate_I_E * I_E02 - rate_I_A * I_A02  # Asymptomatic infectious
deriv(I_M02) <- p_S * (1 - IHR02) * rate_I_E * I_E02 - rate_I_M * I_M02  # Symptomatic mild (infectious)
deriv(I_H02) <- p_S * IHR02 * rate_I_E * I_E02 - new_hospitalisations02  # Symptomatic severe (infectious)
deriv(H02) <- new_hospitalisations02 - rate_H * H02  # Hospitalized (not infectious)
deriv(T02) <- testing_rate * I_A02 - rate_T * T02  # Tested and isolated
deriv(R02) <- rate_I_A * I_A02 + rate_I_M * I_M02 + rate_T * T02 + (1 - HFR) * rate_H * H02  # Recovered
deriv(D02) <- new_deaths02  # Deaths

# Initial conditions for age group 02 (school-age, no seeding with infections)
initial(S02) <- N02
initial(E02) <- 0
initial(I_E02) <- 0
initial(I_A02) <- 0
initial(I_M02) <- 0
initial(I_H02) <- 0
initial(H02) <- 0
initial(T02) <- 0
initial(R02) <- 0
initial(D02) <- 0

# Compartment flow (from exposed to presymptomatic and further compartments)
deriv(S03) <- -new_infections03
deriv(E03) <- new_infections03 - rate_E * E03  # Non-infectious exposed
deriv(I_E03) <- rate_E * E03 - rate_I_E * I_E03  # Presymptomatic infectious
deriv(I_A03) <- (1 - p_S) * rate_I_E * I_E03 - rate_I_A * I_A03  # Asymptomatic infectious
deriv(I_M03) <- p_S * (1 - IHR03) * rate_I_E * I_E03 - rate_I_M * I_M03  # Symptomatic mild (infectious)
deriv(I_H03) <- p_S * IHR03 * rate_I_E * I_E03 - new_hospitalisations03  # Symptomatic severe (infectious)
deriv(H03) <- new_hospitalisations03 - rate_H * H03  # Hospitalized (not infectious)
deriv(T03) <- testing_rate * I_A03 - rate_T * T03  # Tested and isolated
deriv(R03) <- rate_I_A * I_A03 + rate_I_M * I_M03 + rate_T * T03 + (1 - HFR) * rate_H * H03  # Recovered
deriv(D03) <- new_deaths03  # Deaths

# Initial conditions for age group 03 (school-age, no seeding with infections)
initial(S03) <- N03
initial(E03) <- 0
initial(I_E03) <- 0
initial(I_A03) <- 0
initial(I_M03) <- 0
initial(I_H03) <- 0
initial(H03) <- 0
initial(T03) <- 0
initial(R03) <- 0
initial(D03) <- 0


# Check total population size by adding all compartments for each age group
output(check_total_popsize) <-
  (S01 + E01 + I_E01 + I_A01 + I_M01 + I_H01 + H01 + T01 + R01 + D01) +
  (S02 + E02 + I_E02 + I_A02 + I_M02 + I_H02 + H02 + T02 + R02 + D02) +
  (S03 + E03 + I_E03 + I_A03 + I_M03 + I_H03 + H03 + T03 + R03 + D03)



# Summary outputs 
output(S) <- S01 + S02 + S03
output(E) <- E01 + E02 + E03
output(I) <- I_E01 + I_E02 + I_E03 +
  I_A01 + I_A02 + I_A03 +
  I_M01 + I_M02 + I_M03 +
  I_H01 + I_H02 + I_H03
output(H) <- H01 + H02 + H03
output(T) <- T01 + T02 + T03
output(R) <- R01 + R02 + R03



