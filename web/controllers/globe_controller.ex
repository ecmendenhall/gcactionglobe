defmodule Gcactionglobe.GlobeController do
  use Gcactionglobe.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end

  def globe(conn, _prams) do
    render conn, "globe.html"
  end

end
