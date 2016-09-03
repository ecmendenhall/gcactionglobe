defmodule Gcactionglobe.WebhookController do
  use Gcactionglobe.Web, :controller

  def webhook(conn, params) do
    event = params["event"]
    ip = params["context"]["ip"]
    %{city: city} = Geolix.lookup(ip)
    latlon = %{
        ip: ip,
        lat: city.location.latitude,
        lon: city.location.longitude
      }
    if event == "Event Action Take" do
      Gcactionglobe.Endpoint.broadcast("activity:action", "new_msg", latlon)
    end
    Gcactionglobe.Endpoint.broadcast("activity:*", "new_msg", latlon)
    json conn, latlon
  end

end
