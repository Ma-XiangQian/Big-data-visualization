import yaml
import numpy as np 
import pandas as pd 
from sqlalchemy import create_engine,MetaData,Table

# 表结构
# 省份 province
# 地区 area
# 年 year
# 月 month
# 消费额 ConsumptionAmount
# 商品量 goods

with open("config.yml","r") as fp:
    try:
        config = yaml.safe_load(fp)
    except yaml.YAMLError as e:
        print(e)

# 数据库用户名
user = config['mysql']["user"]
# 数据库端口
port = config['mysql']["port"]
# 数据库密码
password = config['mysql']["password"]
# 数据库地址
adress = config['mysql']["adress"]
# 数据库名
dataBase = config['mysql']["dataBase"]
# 数据表名
dataSheet = config['mysql']["dataSheet"]
# 最小年份
startYear = config['data']["startYear"]
# 最大年份
endYear = config['data']["endYear"]

data_format = {
    "东北":["黑龙江省","吉林省","辽宁省"],
    "华北":["北京市","天津市","河北省","山西省","内蒙古自治区"],
    "西北":["陕西省","甘肃省","青海省","宁夏回族自治区","新疆维吾尔自治区"],
    "华中":["河南省","湖北省","湖南省"],
    "华东":["山东省","江苏省","安徽省","上海市","浙江省","江西省","福建省","台湾省"],
    "西南":["重庆市","贵州省","四川省","云南省","西藏自治区"],
    "华南":["广东省","香港特别行政区","澳门特别行政区","海南省","广西壮族自治区"]
}


def getData(year: int):
    data={
        "province":[],
        "area":[],
        "year":[],
        "month":[],
        "ConsumptionAmount":[],
        "goods":[]
    }
    for key,item in data_format.items():
        for p in item:
            month = 1
            while month<=12:
                data["province"].append(p)
                data["area"].append(key)
                data["year"].append(year)
                data["month"].append(month)
                data["ConsumptionAmount"].append(np.random.randint(10000,100000))
                data["goods"].append(np.random.randint(1000,10000))
                month +=1
    return data


conn = create_engine(f"mysql+pymysql://{user}:{password}@{adress}:{port}/{dataBase}")

# 创建元数据对象  
metadata = MetaData()  
  
# 反射数据库以获取所有表的元数据  
metadata.reflect(bind=conn)  
  
# 检查'city'表是否存在于metadata中  
if dataSheet in metadata.tables:  
    # 如果存在，则删除表  
    city_table = metadata.tables[dataSheet]  
    city_table.drop(conn)  
    print(f"{dataSheet}数据表: 已经存在，之前的数据将全部清除！")

for y in range(startYear,endYear+1):
    data = pd.DataFrame(getData(year=y))
    data.to_sql(con=conn,name=dataSheet,if_exists="append",index=False)

print("新的数据已导入.....")