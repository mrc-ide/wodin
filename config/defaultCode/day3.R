beta <- user(0.5) # contact rate
nu <- user(0.3) # recovery
N <- user(1000)  # total population.

I0_at_steady_state <- user(1)

I0 <- user(1)

## Steady-state prevelance
I_star <- if (beta > nu) N * (beta - nu) / beta else 0

dt <- 0.01
time <- step * dt

## Deterministic solution
I_init <- if (I0_at_steady_state > 0) I_star else I0

initial(I_det) <- I_init
update(I_det) <- I_star / (1 + (I_star / I_init - 1) * exp(-(beta - nu) * time))

## Stochastic solution
initial(I) <- if (I0_at_steady_state > 0) round(I_star) else I0

FOI <- beta * I / N

initial(S) <- N - I_init
update(S) <- N - I

n_infections <- rbinom(S, FOI * dt)
n_recoveries <- rbinom(I, nu * dt)

update(I) <- I + n_infections - n_recoveries

initial(extinct) <- I_init == 0
update(extinct) <- I_init == 0
