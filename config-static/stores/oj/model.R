n_age <- parameter(3, type = "integer")

s_0 <- parameter()
dim(s_0) <- n_age

dim(s) <- n_age
initial(s[]) <- s_0[i]

beta_t <- parameter()
dim(beta_t) <- parameter(rank = 1)

beta_x <- parameter()
dim(beta_x) <- length(beta_t)

beta <- interpolate(beta_t, beta_x, "constant")

age_by_sex_susceptibility <- parameter()
dim(age_by_sex_susceptibility) <- c(n_age, 2)

lambda[] <- beta * sum(age_by_sex_susceptibility[i, ]) / 2
dim(lambda) <- n_age
update(s[]) <- if (s[i] <= 0) 0 else
  max(0, min(s[i] - lambda[i], Binomial(max((s[i] - lambda[i]) * 2, 0), 0.5)))
