defmodule Gcactionglobe.Router do
  use Gcactionglobe.Web, :router

  pipeline :browser do
    plug Plug.SSL,
      force_ssl: [rewrite_on: [:x_forwarded_proto]],
      host: "live.globalcitizen.org"
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug Plug.SSL,
      force_ssl: [rewrite_on: [:x_forwarded_proto]],
      host: "live.globalcitizen.org"
    plug :accepts, ["json"]
  end

  scope "/_healthcheck", Gcactionglobe do
    get "/", HealthcheckController, :check
  end

  scope "/", Gcactionglobe do
    pipe_through :browser # Use the default browser stack

    get "/", GlobeController, :index
  end

  scope "/api", Gcactionglobe do
    pipe_through :api
    post "/webhook", WebhookController, :webhook
  end
end
