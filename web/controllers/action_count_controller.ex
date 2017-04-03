defmodule Gcactionglobe.ActionCountController do
  use Gcactionglobe.Web, :controller

  def get_token do
    id = System.get_env("LOOKER_CLIENT_ID")
    secret = System.get_env("LOOKER_CLIENT_SECRET")
    %HTTPotion.Response{body: body} = HTTPotion.post(
      "https://globalcitizen.looker.com:19999/login",
      [body: "client_id=#{ id }&client_secret=#{ secret }"]
    )
    body_data = Poison.decode!(body)
    body_data["access_token"]
  end

  def india_action_count(token) do
    response = HTTPotion.get(
      "https://globalcitizen.looker.com:19999/api/3.0/looks/1351/run/json" ,
      [headers: ["Authorization": "token #{token}"]]
    )
    body_data = Poison.decode!(response.body)
    [india_action_count_data] = body_data
    india_action_count_data["india_actions_completedaction.count_actions_taken"]
  end

  def global_action_count(token) do
    response = HTTPotion.get(
      "https://globalcitizen.looker.com:19999/api/3.0/looks/1517/run/json" ,
      [headers: ["Authorization": "token #{token}"]]
    )
    body_data = Poison.decode!(response.body)
    [global_action_count_data] = body_data
    global_action_count_data["action_activity.count_actions_taken"]
  end

  def load_action_count(conn, _) do
    token = get_token
    total = global_action_count(token) + india_action_count(token) + 3331855
    json conn, %{total_actions_taken: total}
  end

end
