defmodule Gcactionglobe.GlobeController do
  use Gcactionglobe.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end

end
