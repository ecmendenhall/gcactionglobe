# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# Configures the endpoint
config :gcactionglobe, Gcactionglobe.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "gLRyf8JQ8Q40it+aGCgD0Wt2UBgS/GE5V7RUXUQiIbdQBmvW7mz1nViTpSlxKnSm",
  render_errors: [view: Gcactionglobe.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Gcactionglobe.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :geolix,
  databases: [
    {:city,  "https://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz"}, # 
  ]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
