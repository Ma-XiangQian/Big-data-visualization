import requests

url = "http://localhost:8080/city"
headers = {
    "Content-Type":"application/json"
}
data = {"startYear":2024,"endYear":2024}
res = requests.post(url,json=data,headers=headers)
print(res.text)