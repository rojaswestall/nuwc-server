from pymongo import MongoClient

url = 'mongodb://nu-worldcupadmin:2018@ds257579.mlab.com:57579/nu-worldcup';


client = MongoClient(url)

db = client['nu-worldcup']

teams = db.teams
#print(teams)
countrylist = ["Andorra", "Belarus", "Brazil", "Bulgaria", "Cameroon", "Croatia", "Chad", "China", "Colombia", "Denmark", "Ecuador",
"France", "Germany", "Hong-Kong", "India", "Israel", "Iceland", "Iran", "Italy", "Kazakhstan", "Lebanon", "Mexico", "Mozambique", 
"Mongolia", "Nigeria", "Nicaragua", "Peru", "Poland", "Saudi-Arabia", "St.-Lucia", "Sierra-Leone", "South-Korea", "St.-Kitts-&-Nevis", 
"Sweden", "Taiwan", "Vietnam", "USA", "Ukraine", "Argentina", "Australia", "Gonzo-Team-1"]

for country in countrylist:
	db.teams.update_one(
	{'name': country},
	{'$set': {'points':0}}
)

db.teams.update_one(
	{'points': 9},
	{'$set': {'points':0}}
)


#nigeria = teams.find_one({'name': 'Nigeria'})


