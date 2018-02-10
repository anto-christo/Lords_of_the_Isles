import json
from collections import namedtuple
# data ='[{"country":"United Arab Emirates","geonameid":292932,"name":"Ajman","subcountry":"Ajman"},{"country":"United Arab Emirates","geonameid":292968,"name":"Abu Dhabi","subcountry":"Abu Dhabi"},{"country":"United Arab Emirates","geonameid":291696,"name":"Khawr Fakkān","subcountry":"Ash Shāriqah"}]'
data = data.encode("ascii","ignore")

x = json.loads(data, object_hook=lambda d: namedtuple('X', d.keys())(*d.values()))
print (len(x))
f = open("cities.txt","a")
for i in x:
	f.write(i.name)
	f.write('\n')
	# print (i.name)

