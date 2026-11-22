import { i as setOnSetGetEnv, n as getEnv$1, t as createInvalidVariablesError } from "./runtime_BNfvQd4R.mjs";
import { z } from "zod";
import { faBolt, faBriefcase, faCarSide, faClapperboard, faComments, faCompactDisc, faCompass, faCrown, faDragon, faEarthEurope, faEye, faFilm, faFire, faFutbol, faGamepad, faGuitar, faHandFist, faHashtag, faHeart, faHouse, faLaptopCode, faLock, faMask, faMedal, faMugHot, faPaw, faPeopleGroup, faPizzaSlice, faScaleBalanced, faShirt, faShuffle, faStar, faTrophy, faTv, faUserGroup, faVideo, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
// node_modules/astro/dist/env/validators.js
function getEnvFieldType(options) {
	const optional = options.optional ? options.default !== void 0 ? false : true : false;
	let type;
	if (options.type === "enum") type = options.values.map((v) => `'${v}'`).join(" | ");
	else type = options.type;
	return `${type}${optional ? " | undefined" : ""}`;
}
var stringValidator = ({ max, min, length, url, includes, startsWith, endsWith }) => (input) => {
	if (typeof input !== "string") return {
		ok: false,
		errors: ["type"]
	};
	const errors = [];
	if (max !== void 0 && !(input.length <= max)) errors.push("max");
	if (min !== void 0 && !(input.length >= min)) errors.push("min");
	if (length !== void 0 && !(input.length === length)) errors.push("length");
	if (url !== void 0 && !URL.canParse(input)) errors.push("url");
	if (includes !== void 0 && !input.includes(includes)) errors.push("includes");
	if (startsWith !== void 0 && !input.startsWith(startsWith)) errors.push("startsWith");
	if (endsWith !== void 0 && !input.endsWith(endsWith)) errors.push("endsWith");
	if (errors.length > 0) return {
		ok: false,
		errors
	};
	return {
		ok: true,
		value: input
	};
};
var numberValidator = ({ gt, min, lt, max, int }) => (input) => {
	const num = Number.parseFloat(input ?? "");
	if (isNaN(num)) return {
		ok: false,
		errors: ["type"]
	};
	const errors = [];
	if (gt !== void 0 && !(num > gt)) errors.push("gt");
	if (min !== void 0 && !(num >= min)) errors.push("min");
	if (lt !== void 0 && !(num < lt)) errors.push("lt");
	if (max !== void 0 && !(num <= max)) errors.push("max");
	if (int !== void 0) {
		const isInt = Number.isInteger(num);
		if (!(int ? isInt : !isInt)) errors.push("int");
	}
	if (errors.length > 0) return {
		ok: false,
		errors
	};
	return {
		ok: true,
		value: num
	};
};
var booleanValidator = (input) => {
	const bool = input === "true" ? true : input === "false" ? false : void 0;
	if (typeof bool !== "boolean") return {
		ok: false,
		errors: ["type"]
	};
	return {
		ok: true,
		value: bool
	};
};
var enumValidator = ({ values }) => (input) => {
	if (!(typeof input === "string" ? values.includes(input) : false)) return {
		ok: false,
		errors: ["type"]
	};
	return {
		ok: true,
		value: input
	};
};
function selectValidator(options) {
	switch (options.type) {
		case "string": return stringValidator(options);
		case "number": return numberValidator(options);
		case "boolean": return booleanValidator;
		case "enum": return enumValidator(options);
	}
}
function validateEnvVariable(value, options) {
	const isOptional = options.optional || options.default !== void 0;
	if (isOptional && value === void 0) return {
		ok: true,
		value: options.default
	};
	if (!isOptional && value === void 0) return {
		ok: false,
		errors: ["missing"]
	};
	return selectValidator(options)(value);
}
var rivalries_default = {
	version: 1,
	universes: [
		{
			"id": "univers-ecrans",
			"label": "Écrans",
			"tagline": "Tout ce qu’on a regardé au lieu de dormir.",
			"icon": "video",
			"categories": [
				"ecrans",
				"cinefr",
				"dessins",
				"jeux"
			]
		},
		{
			"id": "univers-pop",
			"label": "Pop culture",
			"tagline": "Héros, tubes, memes et autres obsessions.",
			"icon": "star",
			"categories": [
				"heros",
				"musique",
				"duos",
				"internet",
				"geek",
				"nostalgie"
			]
		},
		{
			"id": "univers-vie",
			"label": "La vraie vie",
			"tagline": "Les débats du quotidien, ceux qui fâchent vraiment.",
			"icon": "house",
			"categories": [
				"bouffe",
				"quotidien",
				"mots",
				"sport",
				"mode",
				"autos"
			]
		},
		{
			"id": "univers-imaginaire",
			"label": "Imaginaire",
			"tagline": "Monstres, superpouvoirs et dilemmes impossibles.",
			"icon": "wand-magic-sparkles",
			"categories": [
				"dilemmes",
				"pouvoirs",
				"monstres",
				"animaux"
			]
		}
	],
	categories: [
		{
			"id": "heros",
			"label": "Héros et vilains",
			"tagline": "Des capes, des masques, et des egos surdimensionnés.",
			"icon": "mask",
			"giphyQuery": "superhero pose"
		},
		{
			"id": "bouffe",
			"label": "Bouffe qui divise",
			"tagline": "Ces débats ont gâché plus de repas de famille que la politique.",
			"icon": "pizza-slice",
			"giphyQuery": "delicious food"
		},
		{
			"id": "geek",
			"label": "Tech et geek",
			"tagline": "Les guerres saintes de l’informatique. Aucun survivant.",
			"icon": "laptop-code",
			"giphyQuery": "computer nerd"
		},
		{
			"id": "jeux",
			"label": "Jeux vidéo",
			"tagline": "Manette en main, amitiés en jeu.",
			"icon": "gamepad",
			"giphyQuery": "video game controller"
		},
		{
			"id": "ecrans",
			"label": "Ciné et séries",
			"tagline": "Pop-corn, canapé, et des avis très tranchés.",
			"icon": "film",
			"giphyQuery": "popcorn movie night"
		},
		{
			"id": "duos",
			"label": "Duos à départager",
			"tagline": "Ils sont inséparables. Toi, tu vas devoir choisir.",
			"icon": "user-group",
			"giphyQuery": "best friends duo"
		},
		{
			"id": "quotidien",
			"label": "Vie quotidienne",
			"tagline": "Les petites guerres de tous les jours.",
			"icon": "mug-hot",
			"giphyQuery": "everyday life"
		},
		{
			"id": "musique",
			"label": "Musique",
			"tagline": "Ces débats ont fini plus de soirées que la police.",
			"icon": "guitar",
			"giphyQuery": "dancing music"
		},
		{
			"id": "dessins",
			"label": "Dessins animés",
			"tagline": "Le samedi matin, devant la télé, en pyjama. Choisis ton camp.",
			"icon": "tv",
			"giphyQuery": "classic cartoon"
		},
		{
			"id": "cinefr",
			"label": "Ciné français",
			"tagline": "Des répliques que ton oncle cite encore à chaque repas.",
			"icon": "clapperboard",
			"giphyQuery": "cinema popcorn"
		},
		{
			"id": "internet",
			"label": "Internet et memes",
			"tagline": "Le savoir de toute l’humanité, utilisé surtout pour regarder des chats.",
			"icon": "hashtag",
			"giphyQuery": "internet meme"
		},
		{
			"id": "mots",
			"label": "Mots de chez nous",
			"tagline": "La France, la Belgique, la Suisse et le Québec ne parlent pas tout à fait la même langue.",
			"icon": "comments",
			"giphyQuery": "dictionary words"
		},
		{
			"id": "nostalgie",
			"label": "Nostalgie années 90",
			"tagline": "Avant les smartphones, il y avait ça. Et on était heureux.",
			"icon": "compact-disc",
			"giphyQuery": "90s retro"
		},
		{
			"id": "sport",
			"label": "Sport",
			"tagline": "Des débats plus tendus qu’une finale aux tirs au but.",
			"icon": "futbol",
			"giphyQuery": "sports fan cheering"
		},
		{
			"id": "mode",
			"label": "Mode et looks",
			"tagline": "Le miroir n’a jamais menti. Toi, peut-être.",
			"icon": "shirt",
			"giphyQuery": "fashion runway"
		},
		{
			"id": "autos",
			"label": "Autos et motos",
			"tagline": "Des marques, des moteurs, et des clubs de fans prêts à en découdre.",
			"icon": "car-side",
			"giphyQuery": "fast car"
		},
		{
			"id": "dilemmes",
			"label": "Dilemmes absurdes",
			"tagline": "Aucune bonne réponse. Seulement des mauvaises, et des pires.",
			"icon": "scale-balanced",
			"giphyQuery": "difficult choice"
		},
		{
			"id": "pouvoirs",
			"label": "Superpouvoirs",
			"tagline": "Choisis bien : aucun remboursement, aucun échange.",
			"icon": "bolt",
			"giphyQuery": "superpower"
		},
		{
			"id": "monstres",
			"label": "Monstres et créatures",
			"tagline": "Ils vivent sous ton lit. Et ils ont un avis.",
			"icon": "dragon",
			"giphyQuery": "cartoon monster"
		},
		{
			"id": "animaux",
			"label": "Animaux",
			"tagline": "Ils ne savent pas qu’on les compare. Heureusement.",
			"icon": "paw",
			"giphyQuery": "cute animals"
		}
	],
	rivalries: [
		{
			"id": "heros-batman-superman",
			"category": "heros",
			"a": {
				"name": "Batman",
				"origin": "DC · 1939",
				"line": "Pas de super-pouvoir, juste un excellent comptable.",
				"giphyIds": [],
				"giphyQuery": "Batman"
			},
			"b": {
				"name": "Superman",
				"origin": "DC · 1938",
				"line": "Invincible, sauf face à un caillou vert.",
				"giphyIds": [],
				"giphyQuery": "Superman"
			}
		},
		{
			"id": "heros-marvel-dc",
			"category": "heros",
			"a": {
				"name": "Marvel",
				"origin": "Comics · 1939",
				"line": "Des héros qui ont des problèmes de loyer.",
				"giphyIds": [],
				"giphyQuery": "Marvel Avengers"
			},
			"b": {
				"name": "DC",
				"origin": "Comics · 1934",
				"line": "Des dieux qui ont des problèmes de cape.",
				"giphyIds": [],
				"giphyQuery": "Justice League DC"
			}
		},
		{
			"id": "heros-iron-man-captain-america",
			"category": "heros",
			"a": {
				"name": "Iron Man",
				"origin": "Marvel · 1963",
				"line": "Génie, milliardaire, et pas du tout modeste.",
				"giphyIds": [],
				"giphyQuery": "Iron Man Tony Stark"
			},
			"b": {
				"name": "Captain America",
				"origin": "Marvel · 1941",
				"line": "Congelé soixante-dix ans, toujours aussi poli.",
				"giphyIds": [],
				"giphyQuery": "Captain America"
			}
		},
		{
			"id": "heros-jedi-sith",
			"category": "heros",
			"a": {
				"name": "Les Jedi",
				"origin": "Star Wars",
				"line": "La Force, la sagesse, et de très longues robes beiges.",
				"giphyIds": [],
				"giphyQuery": "Jedi lightsaber"
			},
			"b": {
				"name": "Les Sith",
				"origin": "Star Wars",
				"line": "Le côté obscur, des sabres rouges, et des cookies.",
				"giphyIds": [],
				"giphyQuery": "Sith Darth Sidious"
			}
		},
		{
			"id": "heros-dark-vador-voldemort",
			"category": "heros",
			"a": {
				"name": "Dark Vador",
				"origin": "Star Wars · 1977",
				"line": "Respire fort, parle fort, père absent.",
				"giphyIds": [],
				"giphyQuery": "Darth Vader"
			},
			"b": {
				"name": "Voldemort",
				"origin": "Harry Potter · 1997",
				"line": "Pas de nez, pas d’amis, beaucoup d’horcruxes.",
				"giphyIds": [],
				"giphyQuery": "Voldemort"
			}
		},
		{
			"id": "heros-joker-thanos",
			"category": "heros",
			"a": {
				"name": "Le Joker",
				"origin": "DC · 1940",
				"line": "« Pourquoi tant de sérieux ? »",
				"giphyIds": [],
				"giphyQuery": "Joker Batman"
			},
			"b": {
				"name": "Thanos",
				"origin": "Marvel · 1973",
				"line": "Un claquement de doigts, et la moitié de l’univers en moins.",
				"giphyIds": [],
				"giphyQuery": "Thanos snap"
			}
		},
		{
			"id": "heros-spider-man-deadpool",
			"category": "heros",
			"a": {
				"name": "Spider-Man",
				"origin": "Marvel · 1962",
				"line": "Un grand pouvoir, un petit salaire de photographe.",
				"giphyIds": [],
				"giphyQuery": "Spider-Man"
			},
			"b": {
				"name": "Deadpool",
				"origin": "Marvel · 1991",
				"line": "Parle à la caméra, se régénère, ne s’excuse jamais.",
				"giphyIds": [],
				"giphyQuery": "Deadpool"
			}
		},
		{
			"id": "heros-wolverine-hulk",
			"category": "heros",
			"a": {
				"name": "Wolverine",
				"origin": "Marvel · 1974",
				"line": "Des griffes, des rouflaquettes, et un sale caractère.",
				"giphyIds": [],
				"giphyQuery": "Wolverine X-Men"
			},
			"b": {
				"name": "Hulk",
				"origin": "Marvel · 1962",
				"line": "Toujours en colère. Le pantalon tient, on ne sait pas comment.",
				"giphyIds": [],
				"giphyQuery": "Hulk smash"
			}
		},
		{
			"id": "heros-goku-vegeta",
			"category": "heros",
			"a": {
				"name": "Goku",
				"origin": "Dragon Ball · 1984",
				"line": "Sauve l’univers entre deux repas.",
				"giphyIds": [],
				"giphyQuery": "Goku Dragon Ball"
			},
			"b": {
				"name": "Vegeta",
				"origin": "Dragon Ball · 1988",
				"line": "Prince d’une planète qui n’existe plus. Et il le fait savoir.",
				"giphyIds": [],
				"giphyQuery": "Vegeta Dragon Ball"
			}
		},
		{
			"id": "heros-naruto-sasuke",
			"category": "heros",
			"a": {
				"name": "Naruto",
				"origin": "Naruto · 1999",
				"line": "Veut devenir Hokage. Le répète toutes les cinq minutes.",
				"giphyIds": [],
				"giphyQuery": "Naruto Uzumaki"
			},
			"b": {
				"name": "Sasuke",
				"origin": "Naruto · 1999",
				"line": "Boude pendant des centaines d’épisodes.",
				"giphyIds": [],
				"giphyQuery": "Sasuke Uchiha"
			}
		},
		{
			"id": "heros-gandalf-dumbledore",
			"category": "heros",
			"a": {
				"name": "Gandalf",
				"origin": "Le Hobbit · 1937",
				"line": "« Vous ne passerez pas ! »",
				"giphyIds": [],
				"giphyQuery": "Gandalf you shall not pass"
			},
			"b": {
				"name": "Dumbledore",
				"origin": "Harry Potter · 1997",
				"line": "Sage, puissant, et très avare d’explications.",
				"giphyIds": [],
				"giphyQuery": "Dumbledore"
			}
		},
		{
			"id": "heros-sherlock-holmes-hercule-poirot",
			"category": "heros",
			"a": {
				"name": "Sherlock Holmes",
				"origin": "Arthur Conan Doyle · 1887",
				"line": "Un violon, une pipe, et aucun ami. Sauf un.",
				"giphyIds": [],
				"giphyQuery": "Sherlock Holmes"
			},
			"b": {
				"name": "Hercule Poirot",
				"origin": "Agatha Christie · 1920",
				"line": "Les petites cellules grises, et une moustache impeccable.",
				"giphyIds": [],
				"giphyQuery": "Hercule Poirot"
			}
		},
		{
			"id": "heros-robin-des-bois-zorro",
			"category": "heros",
			"a": {
				"name": "Robin des Bois",
				"origin": "Légende anglaise",
				"line": "Vole aux riches, donne aux pauvres, porte des collants.",
				"giphyIds": [],
				"giphyQuery": "Robin Hood Disney"
			},
			"b": {
				"name": "Zorro",
				"origin": "Johnston McCulley · 1919",
				"line": "Signe tous ses exploits d’un Z. Très discret.",
				"giphyIds": [],
				"giphyQuery": "Zorro"
			}
		},
		{
			"id": "heros-james-bond-oss-117",
			"category": "heros",
			"a": {
				"name": "James Bond",
				"origin": "Ian Fleming · 1953",
				"line": "Au service de Sa Majesté, et des marques de voitures.",
				"giphyIds": [],
				"giphyQuery": "James Bond 007"
			},
			"b": {
				"name": "OSS 117",
				"origin": "Jean Bruce · 1949",
				"line": "« Comment est votre blanquette ? »",
				"giphyIds": ["D37UOXknYbTcQ"],
				"giphyQuery": "OSS 117 Jean Dujardin"
			}
		},
		{
			"id": "bouffe-pain-au-chocolat-chocolatine",
			"category": "bouffe",
			"a": {
				"name": "Pain au chocolat",
				"origin": "La moitié nord de la France",
				"line": "Deux barres de chocolat, zéro débat. Enfin presque.",
				"giphyIds": [],
				"giphyQuery": "pain au chocolat"
			},
			"b": {
				"name": "Chocolatine",
				"origin": "Le Sud-Ouest, fièrement",
				"line": "Le Sud-Ouest n’a jamais cédé. Il ne cédera pas.",
				"giphyIds": [],
				"giphyQuery": "chocolate croissant"
			}
		},
		{
			"id": "bouffe-pizza-ananas",
			"category": "bouffe",
			"question": "Pizza : avec ou sans ananas ?",
			"a": {
				"name": "Avec ananas",
				"origin": "Canada · 1962",
				"line": "Inventée au Canada. Hawaï n’a rien demandé.",
				"giphyIds": [],
				"giphyQuery": "pineapple pizza"
			},
			"b": {
				"name": "Sans ananas",
				"origin": "Naples, depuis toujours",
				"line": "Quelque part en Italie, une grand-mère approuve.",
				"giphyIds": [],
				"giphyQuery": "pizza margherita"
			}
		},
		{
			"id": "bouffe-nutella-confiture",
			"category": "bouffe",
			"a": {
				"name": "Nutella",
				"origin": "Ferrero · 1964",
				"line": "Une cuillère. Puis le pot entier.",
				"giphyIds": [],
				"giphyQuery": "Nutella"
			},
			"b": {
				"name": "Confiture",
				"origin": "Chez ta grand-mère",
				"line": "Faite maison, étiquetée au feutre, datée de 2019.",
				"giphyIds": [],
				"giphyQuery": "jam toast"
			}
		},
		{
			"id": "bouffe-coca-cola-pepsi",
			"category": "bouffe",
			"a": {
				"name": "Coca-Cola",
				"origin": "Atlanta · 1886",
				"line": "La recette est secrète. Le sucre, beaucoup moins.",
				"giphyIds": [],
				"giphyQuery": "Coca-Cola"
			},
			"b": {
				"name": "Pepsi",
				"origin": "Caroline du Nord · 1893",
				"line": "L’éternel challenger. Il gagne les tests à l’aveugle, paraît-il.",
				"giphyIds": [],
				"giphyQuery": "Pepsi"
			}
		},
		{
			"id": "bouffe-cafe-the",
			"category": "bouffe",
			"a": {
				"name": "Café",
				"origin": "Éthiopie, selon la légende",
				"line": "Le carburant officiel des open spaces.",
				"giphyIds": [],
				"giphyQuery": "coffee"
			},
			"b": {
				"name": "Thé",
				"origin": "Chine, selon la légende",
				"line": "Pour ceux qui ont le temps de laisser infuser.",
				"giphyIds": [],
				"giphyQuery": "tea cup"
			}
		},
		{
			"id": "bouffe-sucre-sale",
			"category": "bouffe",
			"a": {
				"name": "Sucré",
				"origin": "Team goûter",
				"line": "Le dessert d’abord. La vie est courte.",
				"giphyIds": [],
				"giphyQuery": "dessert cake"
			},
			"b": {
				"name": "Salé",
				"origin": "Team apéro",
				"line": "Une chips. Puis le paquet entier.",
				"giphyIds": [],
				"giphyQuery": "chips snack"
			}
		},
		{
			"id": "bouffe-ketchup-mayonnaise",
			"category": "bouffe",
			"a": {
				"name": "Ketchup",
				"origin": "États-Unis · 1876",
				"line": "Va sur tout. Surtout là où il ne devrait pas.",
				"giphyIds": [],
				"giphyQuery": "ketchup"
			},
			"b": {
				"name": "Mayonnaise",
				"origin": "Port-Mahon · 1756, paraît-il",
				"line": "Montée à la main, ratée une fois sur deux.",
				"giphyIds": [],
				"giphyQuery": "mayonnaise"
			}
		},
		{
			"id": "bouffe-frites-puree",
			"category": "bouffe",
			"a": {
				"name": "Frites",
				"origin": "Belgique ou France, on se dispute encore",
				"line": "Croustillantes dehors, fondantes dedans, disputées partout.",
				"giphyIds": [],
				"giphyQuery": "french fries"
			},
			"b": {
				"name": "Purée",
				"origin": "La cantine, pour toujours",
				"line": "Le doudou de la gastronomie.",
				"giphyIds": [],
				"giphyQuery": "mashed potatoes"
			}
		},
		{
			"id": "bouffe-mcdonalds-burger-king",
			"category": "bouffe",
			"a": {
				"name": "McDonald’s",
				"origin": "Californie · 1940",
				"line": "Le M jaune, et des frites froides en trois minutes.",
				"giphyIds": [],
				"giphyQuery": "McDonalds fries"
			},
			"b": {
				"name": "Burger King",
				"origin": "Miami · 1954",
				"line": "Grillé à la flamme, couronné en carton.",
				"giphyIds": [],
				"giphyQuery": "Burger King"
			}
		},
		{
			"id": "bouffe-raclette-fondue",
			"category": "bouffe",
			"a": {
				"name": "Raclette",
				"origin": "Valais",
				"line": "Un appareil, huit poêlons, zéro légume.",
				"giphyIds": [],
				"giphyQuery": "raclette cheese"
			},
			"b": {
				"name": "Fondue",
				"origin": "Suisse",
				"line": "Qui perd son pain dans le caquelon paie sa tournée.",
				"giphyIds": [],
				"giphyQuery": "cheese fondue"
			}
		},
		{
			"id": "bouffe-crepe-gaufre",
			"category": "bouffe",
			"a": {
				"name": "Crêpe",
				"origin": "Bretagne",
				"line": "Fine, pliée en quatre, et toujours une de trop.",
				"giphyIds": [],
				"giphyQuery": "crepe"
			},
			"b": {
				"name": "Gaufre",
				"origin": "Belgique",
				"line": "Des petits carreaux conçus pour retenir le sucre glace.",
				"giphyIds": [],
				"giphyQuery": "waffle"
			}
		},
		{
			"id": "bouffe-chocolat-noir-chocolat-au-lait",
			"category": "bouffe",
			"a": {
				"name": "Chocolat noir",
				"origin": "Rayon « adultes »",
				"line": "Amer, élégant, plein d’antioxydants. Il te le rappelle.",
				"giphyIds": [],
				"giphyQuery": "dark chocolate"
			},
			"b": {
				"name": "Chocolat au lait",
				"origin": "Rayon « réconfort »",
				"line": "Doux, régressif, et parfaitement assumé.",
				"giphyIds": [],
				"giphyQuery": "milk chocolate bar"
			}
		},
		{
			"id": "bouffe-pates-riz",
			"category": "bouffe",
			"a": {
				"name": "Pâtes",
				"origin": "Italie",
				"line": "Au pesto, à la carbonara, ou à deux heures du matin.",
				"giphyIds": [],
				"giphyQuery": "pasta spaghetti"
			},
			"b": {
				"name": "Riz",
				"origin": "Asie",
				"line": "Le fidèle compagnon de tous les plats en sauce.",
				"giphyIds": [],
				"giphyQuery": "rice bowl"
			}
		},
		{
			"id": "bouffe-kebab-burger",
			"category": "bouffe",
			"a": {
				"name": "Kebab",
				"origin": "Berlin · années 1970",
				"line": "Salade, tomate, oignon. Et la sauce qui coule sur le poignet.",
				"giphyIds": [],
				"giphyQuery": "kebab doner"
			},
			"b": {
				"name": "Burger",
				"origin": "États-Unis",
				"line": "Deux pains, un steak, aucune chance de rester propre.",
				"giphyIds": [],
				"giphyQuery": "burger"
			}
		},
		{
			"id": "geek-mac-pc",
			"category": "geek",
			"a": {
				"name": "Mac",
				"origin": "Apple · 1984",
				"line": "Ça marche. Ne demande pas pourquoi.",
				"giphyIds": [],
				"giphyQuery": "Mac computer Apple"
			},
			"b": {
				"name": "PC",
				"origin": "IBM · 1981",
				"line": "Tu peux tout changer. Tu vas tout changer.",
				"giphyIds": [],
				"giphyQuery": "PC gaming setup"
			}
		},
		{
			"id": "geek-iphone-android",
			"category": "geek",
			"a": {
				"name": "iPhone",
				"origin": "Apple · 2007",
				"line": "Des bulles bleues, et un chargeur jamais compatible.",
				"giphyIds": [],
				"giphyQuery": "iPhone"
			},
			"b": {
				"name": "Android",
				"origin": "Google · 2008",
				"line": "La liberté totale, et quatorze applis préinstallées.",
				"giphyIds": [],
				"giphyQuery": "Android robot"
			}
		},
		{
			"id": "geek-playstation-xbox",
			"category": "geek",
			"a": {
				"name": "PlayStation",
				"origin": "Sony · 1994",
				"line": "Le CD qui tourne, la démo qui charge.",
				"giphyIds": [],
				"giphyQuery": "PlayStation"
			},
			"b": {
				"name": "Xbox",
				"origin": "Microsoft · 2001",
				"line": "Une manette énorme, et Halo dedans.",
				"giphyIds": [],
				"giphyQuery": "Xbox"
			}
		},
		{
			"id": "geek-tabulations-espaces",
			"category": "geek",
			"question": "Pour indenter ton code : tabulations ou espaces ?",
			"a": {
				"name": "Tabulations",
				"origin": "Ton éditeur de code",
				"line": "Une touche, toute l’indentation. Efficace.",
				"giphyIds": [],
				"giphyQuery": "keyboard typing fast"
			},
			"b": {
				"name": "Espaces",
				"origin": "Ton éditeur de code",
				"line": "Quatre appuis, zéro ambiguïté. Paraît-il.",
				"giphyIds": [],
				"giphyQuery": "space bar keyboard"
			}
		},
		{
			"id": "geek-vim-emacs",
			"category": "geek",
			"a": {
				"name": "Vim",
				"origin": "Bram Moolenaar · 1991",
				"line": "Facile à ouvrir. Impossible à quitter.",
				"giphyIds": [],
				"giphyQuery": "vim exit"
			},
			"b": {
				"name": "Emacs",
				"origin": "Richard Stallman · 1976",
				"line": "Un éditeur de texte. Et un système d’exploitation. Et un mode de vie.",
				"giphyIds": [],
				"giphyQuery": "programmer hacker"
			}
		},
		{
			"id": "geek-mode-sombre-mode-clair",
			"category": "geek",
			"a": {
				"name": "Mode sombre",
				"origin": "Les réglages, tout en bas",
				"line": "Pour coder la nuit et avoir l’air mystérieux.",
				"giphyIds": [],
				"giphyQuery": "dark mode"
			},
			"b": {
				"name": "Mode clair",
				"origin": "Les réglages par défaut",
				"line": "Pour ceux qui codent en terrasse.",
				"giphyIds": [],
				"giphyQuery": "sunglasses bright light"
			}
		},
		{
			"id": "geek-windows-linux",
			"category": "geek",
			"a": {
				"name": "Windows",
				"origin": "Microsoft · 1985",
				"line": "Une mise à jour s’installe. Ne pas éteindre.",
				"giphyIds": [],
				"giphyQuery": "Windows update"
			},
			"b": {
				"name": "Linux",
				"origin": "Linus Torvalds · 1991",
				"line": "Gratuit, libre, il suffit de recompiler le noyau.",
				"giphyIds": [],
				"giphyQuery": "Linux penguin Tux"
			}
		},
		{
			"id": "geek-chrome-firefox",
			"category": "geek",
			"a": {
				"name": "Chrome",
				"origin": "Google · 2008",
				"line": "Rapide, efficace, et affamé de mémoire vive.",
				"giphyIds": [],
				"giphyQuery": "Google Chrome"
			},
			"b": {
				"name": "Firefox",
				"origin": "Mozilla · 2004",
				"line": "Un renard, une conscience, et des extensions partout.",
				"giphyIds": [],
				"giphyQuery": "Firefox fox"
			}
		},
		{
			"id": "geek-star-wars-star-trek",
			"category": "geek",
			"a": {
				"name": "Star Wars",
				"origin": "George Lucas · 1977",
				"line": "« Que la Force soit avec toi. »",
				"giphyIds": [],
				"giphyQuery": "Star Wars"
			},
			"b": {
				"name": "Star Trek",
				"origin": "Gene Roddenberry · 1966",
				"line": "« Longue vie et prospérité. »",
				"giphyIds": [],
				"giphyQuery": "Star Trek Spock"
			}
		},
		{
			"id": "geek-livre-papier-liseuse",
			"category": "geek",
			"a": {
				"name": "Livre papier",
				"origin": "Gutenberg · vers 1450",
				"line": "L’odeur, le poids, et le marque-page oublié dedans.",
				"giphyIds": [],
				"giphyQuery": "reading book"
			},
			"b": {
				"name": "Liseuse",
				"origin": "Ta poche",
				"line": "Mille livres dans la poche, aucune odeur.",
				"giphyIds": [],
				"giphyQuery": "e-reader kindle"
			}
		},
		{
			"id": "geek-merge-rebase",
			"category": "geek",
			"question": "Sur Git : merge ou rebase ?",
			"a": {
				"name": "Merge",
				"origin": "Git · 2005",
				"line": "L’histoire telle qu’elle s’est passée.",
				"giphyIds": [],
				"giphyQuery": "merge traffic"
			},
			"b": {
				"name": "Rebase",
				"origin": "Git · 2005",
				"line": "L’histoire telle qu’on aurait voulu qu’elle se passe.",
				"giphyIds": [],
				"giphyQuery": "rewrite history"
			}
		},
		{
			"id": "geek-azerty-qwerty",
			"category": "geek",
			"a": {
				"name": "AZERTY",
				"origin": "Les claviers français",
				"line": "Le point en majuscule. On s’y est fait.",
				"giphyIds": [],
				"giphyQuery": "keyboard typing"
			},
			"b": {
				"name": "QWERTY",
				"origin": "Machine à écrire · 1873",
				"line": "Le standard mondial. Sauf ici.",
				"giphyIds": [],
				"giphyQuery": "typewriter"
			}
		},
		{
			"id": "geek-wi-fi-cable",
			"category": "geek",
			"a": {
				"name": "Wi-Fi",
				"origin": "Partout",
				"line": "Ça capte partout. Sauf dans ta chambre.",
				"giphyIds": [],
				"giphyQuery": "wifi signal"
			},
			"b": {
				"name": "Câble Ethernet",
				"origin": "Derrière le meuble télé",
				"line": "Moche, mais jamais en panne.",
				"giphyIds": [],
				"giphyQuery": "ethernet cable"
			}
		},
		{
			"id": "geek-clippy-siri",
			"category": "geek",
			"a": {
				"name": "Le trombone de Word",
				"origin": "Microsoft Office · 1997",
				"line": "« On dirait que vous écrivez une lettre. »",
				"giphyIds": [],
				"giphyQuery": "Clippy Microsoft Office"
			},
			"b": {
				"name": "Siri",
				"origin": "Apple · 2011",
				"line": "« Je n’ai pas bien compris. »",
				"giphyIds": [],
				"giphyQuery": "Siri iPhone"
			}
		},
		{
			"id": "jeux-mario-sonic",
			"category": "jeux",
			"a": {
				"name": "Mario",
				"origin": "Nintendo · 1981",
				"line": "Plombier, pilote, médecin, tennisman. Aucun diplôme.",
				"giphyIds": [],
				"giphyQuery": "Super Mario"
			},
			"b": {
				"name": "Sonic",
				"origin": "Sega · 1991",
				"line": "Trop rapide pour cette page.",
				"giphyIds": [],
				"giphyQuery": "Sonic the Hedgehog"
			}
		},
		{
			"id": "jeux-nintendo-sega",
			"category": "jeux",
			"a": {
				"name": "Nintendo",
				"origin": "Kyoto · 1889",
				"line": "Ça a commencé par des cartes à jouer. Vraiment.",
				"giphyIds": [],
				"giphyQuery": "Nintendo retro"
			},
			"b": {
				"name": "Sega",
				"origin": "Japon · 1960",
				"line": "« Sega, c’est plus fort que toi. »",
				"giphyIds": [],
				"giphyQuery": "Sega Mega Drive"
			}
		},
		{
			"id": "jeux-tetris-snake",
			"category": "jeux",
			"a": {
				"name": "Tetris",
				"origin": "Alexeï Pajitnov · 1984",
				"line": "Toujours pas de barre droite.",
				"giphyIds": [],
				"giphyQuery": "Tetris"
			},
			"b": {
				"name": "Snake",
				"origin": "Nokia · 1997",
				"line": "Ne te mords pas la queue.",
				"giphyIds": [],
				"giphyQuery": "Snake Nokia"
			}
		},
		{
			"id": "jeux-link-zelda",
			"category": "jeux",
			"a": {
				"name": "Link",
				"origin": "Nintendo · 1986",
				"line": "Le héros. Tout le monde l’appelle Zelda.",
				"giphyIds": [],
				"giphyQuery": "Link Legend of Zelda"
			},
			"b": {
				"name": "Zelda",
				"origin": "Nintendo · 1986",
				"line": "La princesse. Le jeu porte son nom, ce n’est pas sa faute.",
				"giphyIds": [],
				"giphyQuery": "Princess Zelda"
			}
		},
		{
			"id": "jeux-pikachu-rondoudou",
			"category": "jeux",
			"a": {
				"name": "Pikachu",
				"origin": "Pokémon · 1996",
				"line": "« Pika pika ! »",
				"giphyIds": [],
				"giphyQuery": "Pikachu"
			},
			"b": {
				"name": "Rondoudou",
				"origin": "Pokémon · 1996",
				"line": "Chante, tout le monde s’endort, et il le prend très mal.",
				"giphyIds": [],
				"giphyQuery": "Jigglypuff"
			}
		},
		{
			"id": "jeux-street-fighter-mortal-kombat",
			"category": "jeux",
			"a": {
				"name": "Street Fighter II",
				"origin": "Capcom · 1991",
				"line": "« Hadoken ! »",
				"giphyIds": [],
				"giphyQuery": "Street Fighter II hadouken"
			},
			"b": {
				"name": "Mortal Kombat",
				"origin": "Midway · 1992",
				"line": "« Finish him ! »",
				"giphyIds": [],
				"giphyQuery": "Mortal Kombat"
			}
		},
		{
			"id": "jeux-minecraft-les-sims",
			"category": "jeux",
			"a": {
				"name": "Minecraft",
				"origin": "Mojang · 2011",
				"line": "Des cubes à perte de vue, et un creeper derrière toi.",
				"giphyIds": [],
				"giphyQuery": "Minecraft"
			},
			"b": {
				"name": "Les Sims",
				"origin": "Maxis · 2000",
				"line": "Retirer l’échelle de la piscine.",
				"giphyIds": [],
				"giphyQuery": "The Sims"
			}
		},
		{
			"id": "jeux-lara-croft-nathan-drake",
			"category": "jeux",
			"a": {
				"name": "Lara Croft",
				"origin": "Tomb Raider · 1996",
				"line": "Pille des tombeaux depuis avant que ce soit cool.",
				"giphyIds": [],
				"giphyQuery": "Lara Croft Tomb Raider"
			},
			"b": {
				"name": "Nathan Drake",
				"origin": "Uncharted · 2007",
				"line": "Tombe de partout, s’en sort toujours, avec une blague.",
				"giphyIds": [],
				"giphyQuery": "Nathan Drake Uncharted"
			}
		},
		{
			"id": "jeux-crash-bandicoot-spyro",
			"category": "jeux",
			"a": {
				"name": "Crash Bandicoot",
				"origin": "PlayStation · 1996",
				"line": "Une toupie, des caisses, et beaucoup de cris.",
				"giphyIds": [],
				"giphyQuery": "Crash Bandicoot"
			},
			"b": {
				"name": "Spyro",
				"origin": "PlayStation · 1998",
				"line": "Un petit dragon violet qui crache du feu sur des moutons.",
				"giphyIds": [],
				"giphyQuery": "Spyro the Dragon"
			}
		},
		{
			"id": "jeux-manette-clavier-souris",
			"category": "jeux",
			"a": {
				"name": "Manette",
				"origin": "Le canapé",
				"line": "Les potes, les chips, et le câble toujours trop court.",
				"giphyIds": [],
				"giphyQuery": "gamepad controller"
			},
			"b": {
				"name": "Clavier-souris",
				"origin": "Le bureau",
				"line": "Une précision chirurgicale, et le dos en compote.",
				"giphyIds": [],
				"giphyQuery": "gaming keyboard mouse"
			}
		},
		{
			"id": "jeux-pac-man-space-invaders",
			"category": "jeux",
			"a": {
				"name": "Pac-Man",
				"origin": "Namco · 1980",
				"line": "Waka waka waka waka.",
				"giphyIds": [],
				"giphyQuery": "Pac-Man"
			},
			"b": {
				"name": "Space Invaders",
				"origin": "Taito · 1978",
				"line": "Ils descendent. Lentement. Puis très vite.",
				"giphyIds": [],
				"giphyQuery": "Space Invaders"
			}
		},
		{
			"id": "jeux-game-boy-game-gear",
			"category": "jeux",
			"a": {
				"name": "Game Boy",
				"origin": "Nintendo · 1989",
				"line": "Quatre nuances de vert, des piles par paquets de douze.",
				"giphyIds": [],
				"giphyQuery": "Game Boy"
			},
			"b": {
				"name": "Game Gear",
				"origin": "Sega · 1990",
				"line": "En couleur ! Six piles, à peine trois heures d’autonomie.",
				"giphyIds": [],
				"giphyQuery": "Sega Game Gear"
			}
		},
		{
			"id": "jeux-goldeneye-mario-kart-64",
			"category": "jeux",
			"question": "Soirée Nintendo 64 : GoldenEye ou Mario Kart ?",
			"a": {
				"name": "GoldenEye 007",
				"origin": "Nintendo 64 · 1997",
				"line": "Interdit de prendre Oddjob.",
				"giphyIds": [],
				"giphyQuery": "GoldenEye 007 N64"
			},
			"b": {
				"name": "Mario Kart 64",
				"origin": "Nintendo 64 · 1996",
				"line": "Une carapace bleue, et une amitié brisée.",
				"giphyIds": [],
				"giphyQuery": "Mario Kart 64"
			}
		},
		{
			"id": "jeux-bowser-ganon",
			"category": "jeux",
			"a": {
				"name": "Bowser",
				"origin": "Nintendo · 1985",
				"line": "Enlève la même princesse depuis 1985. Persévérant.",
				"giphyIds": [],
				"giphyQuery": "Bowser"
			},
			"b": {
				"name": "Ganon",
				"origin": "Nintendo · 1986",
				"line": "Revient à chaque épisode, perd à chaque épisode.",
				"giphyIds": [],
				"giphyQuery": "Ganondorf"
			}
		},
		{
			"id": "ecrans-edward-jacob",
			"category": "ecrans",
			"a": {
				"name": "Edward",
				"origin": "Twilight · 2008",
				"line": "Brille au soleil et te regarde dormir.",
				"giphyIds": [],
				"giphyQuery": "Edward Cullen Twilight"
			},
			"b": {
				"name": "Jacob",
				"origin": "Twilight · 2008",
				"line": "Toujours torse nu, toujours en avance.",
				"giphyIds": [],
				"giphyQuery": "Jacob Black Twilight"
			}
		},
		{
			"id": "ecrans-harry-potter-seigneur-des-anneaux",
			"category": "ecrans",
			"a": {
				"name": "Harry Potter",
				"origin": "J. K. Rowling · 1997",
				"line": "Une baguette, une cicatrice, sept tomes.",
				"giphyIds": [],
				"giphyQuery": "Harry Potter"
			},
			"b": {
				"name": "Le Seigneur des anneaux",
				"origin": "J. R. R. Tolkien · 1954",
				"line": "Neuf compagnons, un anneau, énormément de marche.",
				"giphyIds": [],
				"giphyQuery": "Lord of the Rings fellowship"
			}
		},
		{
			"id": "ecrans-gryffondor-serpentard",
			"category": "ecrans",
			"a": {
				"name": "Gryffondor",
				"origin": "Harry Potter · 1997",
				"line": "Courage, loyauté, et règlement intérieur facultatif.",
				"giphyIds": [],
				"giphyQuery": "Gryffindor"
			},
			"b": {
				"name": "Serpentard",
				"origin": "Harry Potter · 1997",
				"line": "Ambition, ruse, et une salle commune sous un lac.",
				"giphyIds": [],
				"giphyQuery": "Slytherin"
			}
		},
		{
			"id": "ecrans-friends-the-office",
			"category": "ecrans",
			"a": {
				"name": "Friends",
				"origin": "NBC · 1994",
				"line": "Six amis, un canapé orange, un loyer impossible.",
				"giphyIds": [],
				"giphyQuery": "Friends TV show"
			},
			"b": {
				"name": "The Office",
				"origin": "NBC · 2005",
				"line": "Un patron gênant, et des regards caméra.",
				"giphyIds": [],
				"giphyQuery": "The Office Michael Scott"
			}
		},
		{
			"id": "ecrans-stark-lannister",
			"category": "ecrans",
			"a": {
				"name": "Les Stark",
				"origin": "Game of Thrones · 2011",
				"line": "« L’hiver vient. »",
				"giphyIds": [],
				"giphyQuery": "Jon Snow Stark"
			},
			"b": {
				"name": "Les Lannister",
				"origin": "Game of Thrones · 2011",
				"line": "Un Lannister paie toujours ses dettes.",
				"giphyIds": [],
				"giphyQuery": "Tyrion Lannister"
			}
		},
		{
			"id": "ecrans-rocky-rambo",
			"category": "ecrans",
			"a": {
				"name": "Rocky",
				"origin": "Rocky · 1976",
				"line": "Court dans les escaliers, crie « Adrian ! ».",
				"giphyIds": [],
				"giphyQuery": "Rocky Balboa"
			},
			"b": {
				"name": "Rambo",
				"origin": "Rambo · 1982",
				"line": "C’est pas lui qui a commencé.",
				"giphyIds": [],
				"giphyQuery": "Rambo"
			}
		},
		{
			"id": "ecrans-indiana-jones-han-solo",
			"category": "ecrans",
			"a": {
				"name": "Indiana Jones",
				"origin": "Les Aventuriers de l’arche perdue · 1981",
				"line": "Un chapeau, un fouet, et une sainte horreur des serpents.",
				"giphyIds": [],
				"giphyQuery": "Indiana Jones"
			},
			"b": {
				"name": "Han Solo",
				"origin": "Star Wars · 1977",
				"line": "A tiré le premier. On en débat encore.",
				"giphyIds": [],
				"giphyQuery": "Han Solo"
			}
		},
		{
			"id": "ecrans-alien-predator",
			"category": "ecrans",
			"a": {
				"name": "Alien",
				"origin": "Alien · 1979",
				"line": "Dans l’espace, personne ne t’entend crier.",
				"giphyIds": [],
				"giphyQuery": "Alien xenomorph"
			},
			"b": {
				"name": "Predator",
				"origin": "Predator · 1987",
				"line": "Invisible, chasseur, et franchement pas photogénique.",
				"giphyIds": [],
				"giphyQuery": "Predator movie"
			}
		},
		{
			"id": "ecrans-terminator-robocop",
			"category": "ecrans",
			"a": {
				"name": "Terminator",
				"origin": "Terminator · 1984",
				"line": "« I’ll be back. »",
				"giphyIds": [],
				"giphyQuery": "Terminator T-800"
			},
			"b": {
				"name": "RoboCop",
				"origin": "RoboCop · 1987",
				"line": "Mi-homme, mi-machine, entièrement flic.",
				"giphyIds": [],
				"giphyQuery": "RoboCop"
			}
		},
		{
			"id": "ecrans-r2-d2-c-3po",
			"category": "ecrans",
			"a": {
				"name": "R2-D2",
				"origin": "Star Wars · 1977",
				"line": "« Bip bip bwiiip. »",
				"giphyIds": [],
				"giphyQuery": "R2-D2 Star Wars"
			},
			"b": {
				"name": "C-3PO",
				"origin": "Star Wars · 1977",
				"line": "Parle six millions de langues, se plaint dans toutes.",
				"giphyIds": [],
				"giphyQuery": "C-3PO Star Wars"
			}
		},
		{
			"id": "ecrans-wall-e-eve",
			"category": "ecrans",
			"a": {
				"name": "WALL-E",
				"origin": "Pixar · 2008",
				"line": "Compacte les déchets, collectionne les briquets, tombe amoureux.",
				"giphyIds": [],
				"giphyQuery": "WALL-E Pixar"
			},
			"b": {
				"name": "EVE",
				"origin": "Pixar · 2008",
				"line": "Élégante, efficace, tire d’abord.",
				"giphyIds": [],
				"giphyQuery": "EVE WALL-E Pixar"
			}
		},
		{
			"id": "ecrans-disney-pixar",
			"category": "ecrans",
			"a": {
				"name": "Disney",
				"origin": "Blanche-Neige · 1937",
				"line": "Des princesses, des chansons, et des parents qui disparaissent tôt.",
				"giphyIds": [],
				"giphyQuery": "Disney castle"
			},
			"b": {
				"name": "Pixar",
				"origin": "Toy Story · 1995",
				"line": "Des jouets, des robots, et toi qui pleures à la fin.",
				"giphyIds": [],
				"giphyQuery": "Pixar lamp"
			}
		},
		{
			"id": "ecrans-kaamelott-les-visiteurs",
			"category": "ecrans",
			"a": {
				"name": "Kaamelott",
				"origin": "M6 · 2005",
				"line": "« C’est pas faux. »",
				"giphyIds": ["zrCSvFfl2fP7W"],
				"giphyQuery": "Kaamelott"
			},
			"b": {
				"name": "Les Visiteurs",
				"origin": "Jean-Marie Poiré · 1993",
				"line": "« Okayyy ! »",
				"giphyIds": ["MrHFzd4JQ22Zy"],
				"giphyQuery": "Les Visiteurs Jacquouille"
			}
		},
		{
			"id": "ecrans-delorean-tardis",
			"category": "ecrans",
			"question": "Pour voyager dans le temps : DeLorean ou TARDIS ?",
			"a": {
				"name": "La DeLorean",
				"origin": "Retour vers le futur · 1985",
				"line": "Carbure au plutonium, ou aux épluchures.",
				"giphyIds": [],
				"giphyQuery": "DeLorean Back to the Future"
			},
			"b": {
				"name": "Le TARDIS",
				"origin": "Doctor Who · 1963",
				"line": "Plus grand à l’intérieur.",
				"giphyIds": [],
				"giphyQuery": "TARDIS Doctor Who"
			}
		},
		{
			"id": "duos-tom-jerry",
			"category": "duos",
			"a": {
				"name": "Tom",
				"origin": "MGM · 1940",
				"line": "Perd depuis 1940. N’abandonne jamais.",
				"giphyIds": [],
				"giphyQuery": "Tom cat Tom and Jerry"
			},
			"b": {
				"name": "Jerry",
				"origin": "MGM · 1940",
				"line": "Petit, malin, et franchement sadique.",
				"giphyIds": [],
				"giphyQuery": "Jerry mouse Tom and Jerry"
			}
		},
		{
			"id": "duos-mulder-scully",
			"category": "duos",
			"a": {
				"name": "Mulder",
				"origin": "X-Files · 1993",
				"line": "Veut croire.",
				"giphyIds": [],
				"giphyQuery": "Fox Mulder X-Files"
			},
			"b": {
				"name": "Scully",
				"origin": "X-Files · 1993",
				"line": "Veut des preuves.",
				"giphyIds": [],
				"giphyQuery": "Dana Scully X-Files"
			}
		},
		{
			"id": "duos-doc-marty",
			"category": "duos",
			"a": {
				"name": "Doc",
				"origin": "Retour vers le futur · 1985",
				"line": "« Nom de Zeus ! »",
				"giphyIds": [],
				"giphyQuery": "Doc Brown great Scott"
			},
			"b": {
				"name": "Marty",
				"origin": "Retour vers le futur · 1985",
				"line": "Un skate, une guitare, et un retard chronique.",
				"giphyIds": [],
				"giphyQuery": "Marty McFly"
			}
		},
		{
			"id": "duos-asterix-obelix",
			"category": "duos",
			"a": {
				"name": "Astérix",
				"origin": "Goscinny et Uderzo · 1959",
				"line": "Petit, rusé, et carburant à la potion.",
				"giphyIds": ["1Md9azxcgIyQ"],
				"giphyQuery": "Asterix"
			},
			"b": {
				"name": "Obélix",
				"origin": "Goscinny et Uderzo · 1959",
				"line": "Pas gros. Tombé dedans quand il était petit.",
				"giphyIds": ["aPpnKwFghQCE8"],
				"giphyQuery": "Astérix  Obelix"
			}
		},
		{
			"id": "duos-laurel-hardy",
			"category": "duos",
			"a": {
				"name": "Laurel",
				"origin": "Cinéma · 1927",
				"line": "Se gratte la tête, pleure, et rate tout.",
				"giphyIds": [],
				"giphyQuery": "Stan Laurel"
			},
			"b": {
				"name": "Hardy",
				"origin": "Cinéma · 1927",
				"line": "« Encore une belle pagaille. »",
				"giphyIds": [],
				"giphyQuery": "Oliver Hardy"
			}
		},
		{
			"id": "duos-bert-ernie",
			"category": "duos",
			"a": {
				"name": "Bert",
				"origin": "1, rue Sésame · 1969",
				"line": "Aime les pigeons, les trombones, et le calme.",
				"giphyIds": [],
				"giphyQuery": "Bert Sesame Street"
			},
			"b": {
				"name": "Ernie",
				"origin": "1, rue Sésame · 1969",
				"line": "Aime son canard en caoutchouc, et réveiller Bert.",
				"giphyIds": [],
				"giphyQuery": "Ernie rubber duckie"
			}
		},
		{
			"id": "duos-woody-buzz",
			"category": "duos",
			"a": {
				"name": "Woody",
				"origin": "Toy Story · 1995",
				"line": "« Il y a un serpent dans ma botte ! »",
				"giphyIds": [],
				"giphyQuery": "Woody Toy Story"
			},
			"b": {
				"name": "Buzz l’Éclair",
				"origin": "Toy Story · 1995",
				"line": "« Vers l’infini et au-delà ! »",
				"giphyIds": [],
				"giphyQuery": "Buzz Lightyear"
			}
		},
		{
			"id": "duos-rick-morty",
			"category": "duos",
			"a": {
				"name": "Rick",
				"origin": "Adult Swim · 2013",
				"line": "Le plus grand génie de l’univers. Et le plus pénible.",
				"giphyIds": [],
				"giphyQuery": "Rick Sanchez"
			},
			"b": {
				"name": "Morty",
				"origin": "Adult Swim · 2013",
				"line": "Quatorze ans, et déjà trop de traumatismes.",
				"giphyIds": [],
				"giphyQuery": "Morty Smith"
			}
		},
		{
			"id": "duos-bob-patrick",
			"category": "duos",
			"a": {
				"name": "Bob l’éponge",
				"origin": "Nickelodeon · 1999",
				"line": "Adore son travail au Crabe Croustillant. Sincèrement.",
				"giphyIds": [],
				"giphyQuery": "SpongeBob"
			},
			"b": {
				"name": "Patrick",
				"origin": "Nickelodeon · 1999",
				"line": "Vit sous un rocher. Littéralement.",
				"giphyIds": [],
				"giphyQuery": "Patrick Star"
			}
		},
		{
			"id": "duos-timon-pumbaa",
			"category": "duos",
			"a": {
				"name": "Timon",
				"origin": "Le Roi lion · 1994",
				"line": "Le cerveau du duo. Selon lui.",
				"giphyIds": [],
				"giphyQuery": "Timon Lion King"
			},
			"b": {
				"name": "Pumbaa",
				"origin": "Le Roi lion · 1994",
				"line": "Le cœur du duo. Et les flatulences.",
				"giphyIds": [],
				"giphyQuery": "Pumbaa Lion King"
			}
		},
		{
			"id": "duos-dupond-dupont",
			"category": "duos",
			"a": {
				"name": "Dupond",
				"origin": "Tintin · 1934",
				"line": "Avec un d, comme dans « détective ».",
				"giphyIds": [],
				"giphyQuery": "Thomson and Thompson Tintin"
			},
			"b": {
				"name": "Dupont",
				"origin": "Tintin · 1934",
				"line": "Avec un t. « Je dirais même plus… »",
				"giphyIds": [],
				"giphyQuery": "Thomson Thompson twins"
			}
		},
		{
			"id": "duos-minus-cortex",
			"category": "duos",
			"a": {
				"name": "Minus",
				"origin": "Animaniacs · 1993",
				"line": "Ne comprend rien, mais avec enthousiasme.",
				"giphyIds": [],
				"giphyQuery": "Pinky Pinky and the Brain"
			},
			"b": {
				"name": "Cortex",
				"origin": "Animaniacs · 1993",
				"line": "« Conquérir le monde ! »",
				"giphyIds": [],
				"giphyQuery": "Brain Pinky and the Brain"
			}
		},
		{
			"id": "duos-shrek-l-ane",
			"category": "duos",
			"a": {
				"name": "Shrek",
				"origin": "Shrek · 2001",
				"line": "Les ogres, c’est comme les oignons : il y a des couches.",
				"giphyIds": [],
				"giphyQuery": "Shrek"
			},
			"b": {
				"name": "L’Âne",
				"origin": "Shrek · 2001",
				"line": "« On est bientôt arrivés ? »",
				"giphyIds": [],
				"giphyQuery": "Donkey Shrek"
			}
		},
		{
			"id": "duos-holmes-watson",
			"category": "duos",
			"a": {
				"name": "Holmes",
				"origin": "Arthur Conan Doyle · 1887",
				"line": "« Élémentaire. »",
				"giphyIds": [],
				"giphyQuery": "Sherlock Holmes deduction"
			},
			"b": {
				"name": "Watson",
				"origin": "Arthur Conan Doyle · 1887",
				"line": "Écrit toutes les enquêtes. Aucune reconnaissance.",
				"giphyIds": [],
				"giphyQuery": "Dr Watson Sherlock"
			}
		},
		{
			"id": "duos-mario-luigi",
			"category": "duos",
			"a": {
				"name": "Mario",
				"origin": "Nintendo · 1981",
				"line": "La casquette rouge, la gloire, les produits dérivés.",
				"giphyIds": [],
				"giphyQuery": "Mario Nintendo"
			},
			"b": {
				"name": "Luigi",
				"origin": "Nintendo · 1983",
				"line": "Plus grand, saute plus haut, toujours deuxième.",
				"giphyIds": [],
				"giphyQuery": "Luigi"
			}
		},
		{
			"id": "quotidien-chat-chien",
			"category": "quotidien",
			"a": {
				"name": "Chat",
				"origin": "Égypte antique",
				"line": "Te tolère. Parfois.",
				"giphyIds": [],
				"giphyQuery": "funny cat"
			},
			"b": {
				"name": "Chien",
				"origin": "Le Paléolithique",
				"line": "T’adore, même après cinq minutes d’absence.",
				"giphyIds": [],
				"giphyQuery": "happy dog"
			}
		},
		{
			"id": "quotidien-mer-montagne",
			"category": "quotidien",
			"a": {
				"name": "Mer",
				"origin": "La plage la plus proche",
				"line": "Du sable partout, jusqu’en décembre.",
				"giphyIds": [],
				"giphyQuery": "beach waves"
			},
			"b": {
				"name": "Montagne",
				"origin": "Le refuge le plus haut",
				"line": "Des randonnées, des refuges, et des mollets en béton.",
				"giphyIds": [],
				"giphyQuery": "mountain hiking"
			}
		},
		{
			"id": "quotidien-ete-hiver",
			"category": "quotidien",
			"a": {
				"name": "Été",
				"origin": "Juillet-août",
				"line": "Apéros en terrasse et coups de soleil.",
				"giphyIds": [],
				"giphyQuery": "summer sun"
			},
			"b": {
				"name": "Hiver",
				"origin": "Décembre-février",
				"line": "Plaids, chocolat chaud, et excuses pour ne pas sortir.",
				"giphyIds": [],
				"giphyQuery": "cozy winter blanket"
			}
		},
		{
			"id": "quotidien-leve-tot-couche-tard",
			"category": "quotidien",
			"a": {
				"name": "Lève-tôt",
				"origin": "6 h du matin",
				"line": "Le monde t’appartient. Il est juste encore fermé.",
				"giphyIds": [],
				"giphyQuery": "sunrise morning"
			},
			"b": {
				"name": "Couche-tard",
				"origin": "2 h du matin",
				"line": "Les meilleures idées arrivent la nuit. Les pires aussi.",
				"giphyIds": [],
				"giphyQuery": "night owl"
			}
		},
		{
			"id": "quotidien-papier-toilette",
			"category": "quotidien",
			"question": "Le papier toilette : par-dessus ou par-dessous ?",
			"a": {
				"name": "Par-dessus",
				"origin": "Le brevet de 1891",
				"line": "Le dessin du brevet original te donne raison.",
				"giphyIds": [],
				"giphyQuery": "toilet paper roll"
			},
			"b": {
				"name": "Par-dessous",
				"origin": "Les rebelles de la salle de bains",
				"line": "Les chats te remercient.",
				"giphyIds": [],
				"giphyQuery": "cat toilet paper"
			}
		},
		{
			"id": "quotidien-douche-bain",
			"category": "quotidien",
			"a": {
				"name": "Douche",
				"origin": "Tous les matins",
				"line": "Cinq minutes, chrono. Concert compris.",
				"giphyIds": [],
				"giphyQuery": "shower singing"
			},
			"b": {
				"name": "Bain",
				"origin": "Le dimanche soir",
				"line": "Une heure, un livre, et l’eau froide à la fin.",
				"giphyIds": [],
				"giphyQuery": "bubble bath"
			}
		},
		{
			"id": "quotidien-sms-appel",
			"category": "quotidien",
			"a": {
				"name": "SMS",
				"origin": "Ton pouce",
				"line": "Écrire, effacer, réécrire, envoyer. Regretter.",
				"giphyIds": [],
				"giphyQuery": "texting phone"
			},
			"b": {
				"name": "Appel",
				"origin": "Ta voix, ce truc oublié",
				"line": "Personne ne décroche, mais c’est l’intention qui compte.",
				"giphyIds": [],
				"giphyQuery": "phone call ringing"
			}
		},
		{
			"id": "quotidien-ville-campagne",
			"category": "quotidien",
			"a": {
				"name": "Ville",
				"origin": "Le métro, ligne 13",
				"line": "Tout est à cinq minutes, sauf le calme.",
				"giphyIds": [],
				"giphyQuery": "city traffic"
			},
			"b": {
				"name": "Campagne",
				"origin": "Le bout du chemin",
				"line": "Du calme, des vaches, et quinze kilomètres jusqu’au pain.",
				"giphyIds": [],
				"giphyQuery": "countryside cows"
			}
		},
		{
			"id": "quotidien-noel-halloween",
			"category": "quotidien",
			"a": {
				"name": "Noël",
				"origin": "Le 25 décembre",
				"line": "Des cadeaux, une dinde, et l’oncle qui parle politique.",
				"giphyIds": [],
				"giphyQuery": "Christmas tree"
			},
			"b": {
				"name": "Halloween",
				"origin": "Le 31 octobre",
				"line": "Des bonbons, des costumes, aucun repas de famille.",
				"giphyIds": [],
				"giphyQuery": "Halloween pumpkin"
			}
		},
		{
			"id": "quotidien-bureau-range-bazar",
			"category": "quotidien",
			"question": "Ton bureau : rangé ou en bazar ?",
			"a": {
				"name": "Rangé",
				"origin": "Un tiroir par catégorie",
				"line": "Chaque chose à sa place, et des étiquettes partout.",
				"giphyIds": [],
				"giphyQuery": "organized desk"
			},
			"b": {
				"name": "En bazar",
				"origin": "Une pile par semaine",
				"line": "C’est un désordre organisé. Tu ne comprendrais pas.",
				"giphyIds": [],
				"giphyQuery": "messy desk"
			}
		},
		{
			"id": "quotidien-reveil-snooze",
			"category": "quotidien",
			"question": "Le réveil sonne : debout ou encore cinq minutes ?",
			"a": {
				"name": "Debout",
				"origin": "Première sonnerie",
				"line": "Levé à la première sonnerie. C’est suspect.",
				"giphyIds": [],
				"giphyQuery": "wake up alarm"
			},
			"b": {
				"name": "Encore cinq minutes",
				"origin": "Neuvième sonnerie",
				"line": "Le bouton snooze est ton meilleur ami. Neuf fois de suite.",
				"giphyIds": [],
				"giphyQuery": "snooze alarm bed"
			}
		},
		{
			"id": "quotidien-cinema-canape",
			"category": "quotidien",
			"question": "Un film ce soir : cinéma ou canapé ?",
			"a": {
				"name": "Cinéma",
				"origin": "La salle 3",
				"line": "Grand écran, pop-corn hors de prix, voisin qui commente.",
				"giphyIds": [],
				"giphyQuery": "cinema popcorn"
			},
			"b": {
				"name": "Canapé",
				"origin": "Ton salon",
				"line": "Le pyjama, la pause quand tu veux, et la sieste à la moitié.",
				"giphyIds": [],
				"giphyQuery": "couch potato tv"
			}
		},
		{
			"id": "quotidien-pizza-froide-rechauffee",
			"category": "quotidien",
			"question": "La pizza du lendemain : froide ou réchauffée ?",
			"a": {
				"name": "Froide",
				"origin": "Le frigo, 8 h du matin",
				"line": "Le petit-déjeuner des champions.",
				"giphyIds": [],
				"giphyQuery": "cold pizza breakfast"
			},
			"b": {
				"name": "Réchauffée",
				"origin": "La poêle, 8 h 05",
				"line": "Croustillante, chaude, et civilisée.",
				"giphyIds": [],
				"giphyQuery": "hot pizza slice"
			}
		},
		{
			"id": "quotidien-organise-improvise",
			"category": "quotidien",
			"question": "En vacances : tout organisé ou tout improvisé ?",
			"a": {
				"name": "Tout organisé",
				"origin": "Un tableur, onglet « bagages »",
				"line": "Le planning est prêt. Le planning B aussi.",
				"giphyIds": [],
				"giphyQuery": "planning checklist"
			},
			"b": {
				"name": "Tout improvisé",
				"origin": "« On verra sur place »",
				"line": "On a vu sur place. C’était bien, finalement.",
				"giphyIds": [],
				"giphyQuery": "road trip adventure"
			}
		},
		{
			"id": "musique-the-beatles-the-rolling-stones",
			"category": "musique",
			"a": {
				"name": "The Beatles",
				"origin": "Liverpool · 1960",
				"line": "Quatre garçons dans le vent, et dans tous les hit-parades.",
				"giphyIds": [],
				"giphyQuery": "The Beatles"
			},
			"b": {
				"name": "The Rolling Stones",
				"origin": "Londres · 1962",
				"line": "Toujours en tournée. Probablement pour l’éternité.",
				"giphyIds": [],
				"giphyQuery": "Rolling Stones"
			}
		},
		{
			"id": "musique-blur-oasis",
			"category": "musique",
			"a": {
				"name": "Blur",
				"origin": "Londres · 1988",
				"line": "La britpop version école d’art.",
				"giphyIds": [],
				"giphyQuery": "Blur band"
			},
			"b": {
				"name": "Oasis",
				"origin": "Manchester · 1991",
				"line": "Deux frères, beaucoup de guitares, et des disputes légendaires.",
				"giphyIds": [],
				"giphyQuery": "Oasis band Gallagher"
			}
		},
		{
			"id": "musique-vinyle-streaming",
			"category": "musique",
			"a": {
				"name": "Vinyle",
				"origin": "La platine du salon",
				"line": "Craque un peu, coûte cher, sonne mieux. Paraît-il.",
				"giphyIds": [],
				"giphyQuery": "vinyl record player"
			},
			"b": {
				"name": "Streaming",
				"origin": "Ton téléphone",
				"line": "Cent millions de titres, et tu écoutes la même playlist.",
				"giphyIds": [],
				"giphyQuery": "headphones music phone"
			}
		},
		{
			"id": "musique-daft-punk-justice",
			"category": "musique",
			"a": {
				"name": "Daft Punk",
				"origin": "Paris · 1993",
				"line": "Deux casques, zéro visage.",
				"giphyIds": [],
				"giphyQuery": "Daft Punk"
			},
			"b": {
				"name": "Justice",
				"origin": "Paris · 2003",
				"line": "Une croix lumineuse et beaucoup de basse.",
				"giphyIds": [],
				"giphyQuery": "Justice band electro"
			}
		},
		{
			"id": "musique-madonna-kylie-minogue",
			"category": "musique",
			"a": {
				"name": "Madonna",
				"origin": "Pop · 1982",
				"line": "Reine de la pop, réinventée tous les dix ans.",
				"giphyIds": [],
				"giphyQuery": "Madonna"
			},
			"b": {
				"name": "Kylie Minogue",
				"origin": "Pop · 1987",
				"line": "La pop australienne, paillettes illimitées.",
				"giphyIds": [],
				"giphyQuery": "Kylie Minogue"
			}
		},
		{
			"id": "musique-johnny-hallyday-eddy-mitchell",
			"category": "musique",
			"a": {
				"name": "Johnny Hallyday",
				"origin": "Rock français · 1960",
				"line": "Cinquante ans de scène, et toujours l’idole des jeunes.",
				"giphyIds": ["3oxHQiQoUiAbB5m2pG"],
				"giphyQuery": "Johnny Hallyday"
			},
			"b": {
				"name": "Eddy Mitchell",
				"origin": "Les Chaussettes noires · 1961",
				"line": "Du rock, du cinéma, et une dernière séance.",
				"giphyIds": [],
				"giphyQuery": "chanteur francais old",
				"gifUrls": ["https://media.tenor.com/mG35Af7nn9YAAAAC/cuisine-americaine-eddy-mitchell.gif"]
			}
		},
		{
			"id": "musique-celine-dion-mylene-farmer",
			"category": "musique",
			"a": {
				"name": "Céline Dion",
				"origin": "Québec · 1981",
				"line": "Une voix qui a traversé le Titanic.",
				"giphyIds": [],
				"giphyQuery": "Celine Dion"
			},
			"b": {
				"name": "Mylène Farmer",
				"origin": "France · 1984",
				"line": "Rousse, mystérieuse, et des clips qui font peur.",
				"giphyIds": [],
				"giphyQuery": "Mylene Farmer"
			}
		},
		{
			"id": "musique-metal-rap",
			"category": "musique",
			"a": {
				"name": "Metal",
				"origin": "Les années 1970",
				"line": "Des cheveux longs et des guitares saturées.",
				"giphyIds": [],
				"giphyQuery": "heavy metal headbang"
			},
			"b": {
				"name": "Rap",
				"origin": "Le Bronx · années 1970",
				"line": "Des rimes, des beats et des punchlines.",
				"giphyIds": [],
				"giphyQuery": "rap hip hop"
			}
		},
		{
			"id": "musique-rock-electro",
			"category": "musique",
			"a": {
				"name": "Rock",
				"origin": "Trois accords",
				"line": "Trois accords et la vérité.",
				"giphyIds": [],
				"giphyQuery": "rock guitar"
			},
			"b": {
				"name": "Électro",
				"origin": "Un ordinateur portable",
				"line": "Un ordinateur, un casque, et des milliers de bras levés.",
				"giphyIds": [],
				"giphyQuery": "electronic music dj"
			}
		},
		{
			"id": "musique-ntm-iam",
			"category": "musique",
			"a": {
				"name": "NTM",
				"origin": "Saint-Denis · 1988",
				"line": "Le 93, et le volume à fond.",
				"giphyIds": [],
				"giphyQuery": "Supreme NTM"
			},
			"b": {
				"name": "IAM",
				"origin": "Marseille · 1989",
				"line": "Marseille, l’Égypte ancienne et des textes ciselés.",
				"giphyIds": [],
				"giphyQuery": "IAM rap Marseille"
			}
		},
		{
			"id": "musique-mozart-beethoven",
			"category": "musique",
			"a": {
				"name": "Mozart",
				"origin": "Salzbourg · 1756",
				"line": "Compose à cinq ans. Toi, tu apprenais à lacer tes chaussures.",
				"giphyIds": [],
				"giphyQuery": "Mozart"
			},
			"b": {
				"name": "Beethoven",
				"origin": "Bonn · 1770",
				"line": "Compose sourd, et ça reste génial.",
				"giphyIds": [],
				"giphyQuery": "Beethoven"
			}
		},
		{
			"id": "musique-guitare-piano",
			"category": "musique",
			"a": {
				"name": "Guitare",
				"origin": "Le feu de camp",
				"line": "Trois accords, une soirée entière.",
				"giphyIds": [],
				"giphyQuery": "acoustic guitar campfire"
			},
			"b": {
				"name": "Piano",
				"origin": "Le salon de ta grand-mère",
				"line": "Quatre-vingt-huit touches et beaucoup de gammes.",
				"giphyIds": [],
				"giphyQuery": "piano playing"
			}
		},
		{
			"id": "musique-eurovision-grammy-awards",
			"category": "musique",
			"a": {
				"name": "Eurovision",
				"origin": "Depuis 1956",
				"line": "Des costumes, des paillettes, et « douze points ».",
				"giphyIds": [],
				"giphyQuery": "Eurovision"
			},
			"b": {
				"name": "Grammy Awards",
				"origin": "Depuis 1959",
				"line": "Des robes, des discours, et des oubliés.",
				"giphyIds": [],
				"giphyQuery": "Grammy Awards"
			}
		},
		{
			"id": "musique-karaoke-blind-test",
			"category": "musique",
			"a": {
				"name": "Karaoké",
				"origin": "Le bar du coin",
				"line": "Tu chantes faux, mais avec conviction.",
				"giphyIds": [],
				"giphyQuery": "karaoke"
			},
			"b": {
				"name": "Blind test",
				"origin": "La soirée entre amis",
				"line": "Tu reconnais tout en deux notes. Tu es insupportable.",
				"giphyIds": [],
				"giphyQuery": "quiz buzzer"
			}
		},
		{
			"id": "musique-concert-festival",
			"category": "musique",
			"a": {
				"name": "Concert",
				"origin": "La salle de spectacle",
				"line": "Un artiste, une salle, et des acouphènes.",
				"giphyIds": [],
				"giphyQuery": "concert crowd"
			},
			"b": {
				"name": "Festival",
				"origin": "Un champ, trois jours",
				"line": "Trois jours, de la boue, et une tente inondée.",
				"giphyIds": [],
				"giphyQuery": "music festival mud"
			}
		},
		{
			"id": "musique-elvis-presley-frank-sinatra",
			"category": "musique",
			"a": {
				"name": "Elvis Presley",
				"origin": "Memphis · 1954",
				"line": "Le King, les déhanchés, les rouflaquettes.",
				"giphyIds": [],
				"giphyQuery": "Elvis Presley"
			},
			"b": {
				"name": "Frank Sinatra",
				"origin": "New York · années 1940",
				"line": "La voix, le smoking, et la classe.",
				"giphyIds": [],
				"giphyQuery": "Frank Sinatra"
			}
		},
		{
			"id": "musique-abba-bee-gees",
			"category": "musique",
			"a": {
				"name": "ABBA",
				"origin": "Suède · 1972",
				"line": "Des paillettes, des pattes d’eph, et l’Eurovision 1974.",
				"giphyIds": [],
				"giphyQuery": "ABBA"
			},
			"b": {
				"name": "Bee Gees",
				"origin": "Australie · 1958",
				"line": "Trois frères, des voix aiguës, et la fièvre du samedi soir.",
				"giphyIds": [],
				"giphyQuery": "Bee Gees"
			}
		},
		{
			"id": "musique-nirvana-pearl-jam",
			"category": "musique",
			"a": {
				"name": "Nirvana",
				"origin": "Seattle · 1987",
				"line": "Un pull rayé, des guitares saturées, une génération.",
				"giphyIds": [],
				"giphyQuery": "Nirvana band"
			},
			"b": {
				"name": "Pearl Jam",
				"origin": "Seattle · 1990",
				"line": "Seattle aussi, mais avec encore plus de cheveux.",
				"giphyIds": [],
				"giphyQuery": "Pearl Jam"
			}
		},
		{
			"id": "musique-queen-led-zeppelin",
			"category": "musique",
			"a": {
				"name": "Queen",
				"origin": "Londres · 1970",
				"line": "Un stade entier qui tape des mains en rythme.",
				"giphyIds": [],
				"giphyQuery": "Queen band"
			},
			"b": {
				"name": "Led Zeppelin",
				"origin": "Londres · 1968",
				"line": "Un dirigeable, des riffs, et un escalier vers le ciel.",
				"giphyIds": [],
				"giphyQuery": "Led Zeppelin"
			}
		},
		{
			"id": "musique-spotify-deezer",
			"category": "musique",
			"a": {
				"name": "Spotify",
				"origin": "Suède · 2008",
				"line": "Le récap de fin d’année qui te juge.",
				"giphyIds": [],
				"giphyQuery": "Spotify"
			},
			"b": {
				"name": "Deezer",
				"origin": "Paris · 2007",
				"line": "Le streaming à la française, cocorico.",
				"giphyIds": [],
				"giphyQuery": "music streaming app"
			}
		},
		{
			"id": "musique-casque-ecouteurs",
			"category": "musique",
			"a": {
				"name": "Casque",
				"origin": "Sur la tête",
				"line": "Isolé du monde, et les cheveux écrasés.",
				"giphyIds": [],
				"giphyQuery": "headphones"
			},
			"b": {
				"name": "Écouteurs",
				"origin": "Dans les oreilles",
				"line": "Un dans chaque oreille, puis un seul, puis zéro.",
				"giphyIds": [],
				"giphyQuery": "earbuds"
			}
		},
		{
			"id": "musique-air-guitar-air-batterie",
			"category": "musique",
			"a": {
				"name": "Air guitar",
				"origin": "Ta chambre",
				"line": "Une guitare invisible et un talent certain.",
				"giphyIds": [],
				"giphyQuery": "air guitar"
			},
			"b": {
				"name": "Air batterie",
				"origin": "Le volant de ta voiture",
				"line": "Tu frappes l’air avec la précision d’un métronome.",
				"giphyIds": [],
				"giphyQuery": "air drums"
			}
		},
		{
			"id": "musique-shakira-beyonce",
			"category": "musique",
			"a": {
				"name": "Shakira",
				"origin": "Colombie · 1991",
				"line": "Les hanches ne mentent pas.",
				"giphyIds": [],
				"giphyQuery": "Shakira"
			},
			"b": {
				"name": "Beyoncé",
				"origin": "Houston · 1997",
				"line": "Une armée de fans et des chorégraphies millimétrées.",
				"giphyIds": [],
				"giphyQuery": "Beyonce"
			}
		},
		{
			"id": "musique-britney-spears-christina-aguilera",
			"category": "musique",
			"a": {
				"name": "Britney Spears",
				"origin": "Le Mickey Mouse Club · 1993",
				"line": "Une écolière, un serpent, et des tubes.",
				"giphyIds": [],
				"giphyQuery": "Britney Spears"
			},
			"b": {
				"name": "Christina Aguilera",
				"origin": "Le Mickey Mouse Club · 1993",
				"line": "Un génie dans une bouteille, et une voix énorme.",
				"giphyIds": [],
				"giphyQuery": "Christina Aguilera"
			}
		},
		{
			"id": "musique-sex-pistols-the-clash",
			"category": "musique",
			"a": {
				"name": "Sex Pistols",
				"origin": "Londres · 1975",
				"line": "Trois ans de carrière, tout le punk dedans.",
				"giphyIds": [],
				"giphyQuery": "Sex Pistols"
			},
			"b": {
				"name": "The Clash",
				"origin": "Londres · 1976",
				"line": "Le punk qui avait des choses à dire.",
				"giphyIds": [],
				"giphyQuery": "The Clash band"
			}
		},
		{
			"id": "musique-bob-marley-bob-dylan",
			"category": "musique",
			"a": {
				"name": "Bob Marley",
				"origin": "Jamaïque · 1963",
				"line": "Le reggae, le soleil, et beaucoup de sérénité.",
				"giphyIds": [],
				"giphyQuery": "Bob Marley"
			},
			"b": {
				"name": "Bob Dylan",
				"origin": "New York · 1961",
				"line": "Un harmonica, une voix nasillarde, un prix Nobel.",
				"giphyIds": [],
				"giphyQuery": "Bob Dylan"
			}
		},
		{
			"id": "musique-taylor-swift-adele",
			"category": "musique",
			"a": {
				"name": "Taylor Swift",
				"origin": "Nashville · 2006",
				"line": "Un album par ère, et des fans qui décodent tout.",
				"giphyIds": [],
				"giphyQuery": "Taylor Swift"
			},
			"b": {
				"name": "Adele",
				"origin": "Londres · 2008",
				"line": "Une voix, un piano, et des mouchoirs.",
				"giphyIds": [],
				"giphyQuery": "Adele"
			}
		},
		{
			"id": "musique-stromae-angele",
			"category": "musique",
			"a": {
				"name": "Stromae",
				"origin": "Bruxelles · 2009",
				"line": "Alors on danse. Et après, on réfléchit.",
				"giphyIds": [],
				"giphyQuery": "Stromae"
			},
			"b": {
				"name": "Angèle",
				"origin": "Bruxelles · 2018",
				"line": "La pop belge, avec un sourire en coin.",
				"giphyIds": [],
				"giphyQuery": "Angele singer"
			}
		},
		{
			"id": "musique-serge-gainsbourg-georges-brassens",
			"category": "musique",
			"a": {
				"name": "Serge Gainsbourg",
				"origin": "Paris · 1958",
				"line": "Une Gitane, un piano, et de la provocation.",
				"giphyIds": [],
				"giphyQuery": "Serge Gainsbourg"
			},
			"b": {
				"name": "Georges Brassens",
				"origin": "Sète · 1952",
				"line": "Une moustache, une guitare, une pipe.",
				"giphyIds": [],
				"giphyQuery": "Georges Brassens"
			}
		},
		{
			"id": "musique-edith-piaf-dalida",
			"category": "musique",
			"a": {
				"name": "Édith Piaf",
				"origin": "Paris · 1935",
				"line": "Un mètre quarante-sept et une voix immense.",
				"giphyIds": [],
				"giphyQuery": "Edith Piaf"
			},
			"b": {
				"name": "Dalida",
				"origin": "Paris · 1956",
				"line": "Des paillettes, des tubes, et « Paroles, paroles ».",
				"giphyIds": [],
				"giphyQuery": "Dalida"
			}
		},
		{
			"id": "musique-musique-classique-jazz",
			"category": "musique",
			"a": {
				"name": "Musique classique",
				"origin": "La salle de concert",
				"line": "On ne tousse pas entre les mouvements.",
				"giphyIds": [],
				"giphyQuery": "orchestra conductor"
			},
			"b": {
				"name": "Jazz",
				"origin": "Le club enfumé",
				"line": "On improvise, et c’est fait exprès.",
				"giphyIds": [],
				"giphyQuery": "jazz saxophone"
			}
		},
		{
			"id": "musique-radio-playlist",
			"category": "musique",
			"a": {
				"name": "Radio",
				"origin": "L’autoradio",
				"line": "Des pubs, des infos, et parfois ta chanson préférée.",
				"giphyIds": [],
				"giphyQuery": "radio vintage"
			},
			"b": {
				"name": "Playlist",
				"origin": "Ton téléphone",
				"line": "Que tes chansons préférées, et aucune surprise.",
				"giphyIds": [],
				"giphyQuery": "playlist music"
			}
		},
		{
			"id": "musique-air-phoenix",
			"category": "musique",
			"a": {
				"name": "Air",
				"origin": "Versailles · 1995",
				"line": "Une musique pour voyager en apesanteur.",
				"giphyIds": [],
				"giphyQuery": "Air french band"
			},
			"b": {
				"name": "Phoenix",
				"origin": "Versailles · 1995",
				"line": "Versailles aussi, mais en guitares.",
				"giphyIds": [],
				"giphyQuery": "Phoenix band"
			}
		},
		{
			"id": "musique-indochine-telephone",
			"category": "musique",
			"a": {
				"name": "Indochine",
				"origin": "Paris · 1981",
				"line": "Quarante ans de concerts et toujours en noir.",
				"giphyIds": [],
				"giphyQuery": "Indochine band"
			},
			"b": {
				"name": "Téléphone",
				"origin": "Paris · 1976",
				"line": "Quatre rockeurs, et un téléphone qui sonne.",
				"giphyIds": [],
				"giphyQuery": "telephone ringing vintage"
			}
		},
		{
			"id": "musique-lady-gaga-katy-perry",
			"category": "musique",
			"a": {
				"name": "Lady Gaga",
				"origin": "New York · 2008",
				"line": "Une robe en viande, et une voix énorme.",
				"giphyIds": [],
				"giphyQuery": "Lady Gaga"
			},
			"b": {
				"name": "Katy Perry",
				"origin": "Californie · 2008",
				"line": "Des bonbons, des feux d’artifice, et un requin qui danse.",
				"giphyIds": [],
				"giphyQuery": "Katy Perry"
			}
		},
		{
			"id": "musique-eminem-snoop-dogg",
			"category": "musique",
			"a": {
				"name": "Eminem",
				"origin": "Detroit · 1996",
				"line": "Débite plus vite que son ombre.",
				"giphyIds": [],
				"giphyQuery": "Eminem"
			},
			"b": {
				"name": "Snoop Dogg",
				"origin": "Long Beach · 1992",
				"line": "Calme, cool, et une émission de cuisine.",
				"giphyIds": [],
				"giphyQuery": "Snoop Dogg"
			}
		},
		{
			"id": "musique-gorillaz-alvin-et-les-chipmunks",
			"category": "musique",
			"a": {
				"name": "Gorillaz",
				"origin": "Damon Albarn · 1998",
				"line": "Un groupe de dessin animé, avec de vrais tubes.",
				"giphyIds": [],
				"giphyQuery": "Gorillaz"
			},
			"b": {
				"name": "Alvin et les Chipmunks",
				"origin": "États-Unis · 1958",
				"line": "Trois écureuils, et des voix en accéléré.",
				"giphyIds": [],
				"giphyQuery": "Alvin and the Chipmunks"
			}
		},
		{
			"id": "musique-chanter-sous-la-douche-chanter-en-voiture",
			"category": "musique",
			"a": {
				"name": "Chanter sous la douche",
				"origin": "La salle de bains",
				"line": "Acoustique parfaite, public absent.",
				"giphyIds": [],
				"giphyQuery": "singing in the shower"
			},
			"b": {
				"name": "Chanter en voiture",
				"origin": "Le périphérique",
				"line": "Concert privé, jusqu’au feu rouge.",
				"giphyIds": [],
				"giphyQuery": "singing in the car"
			}
		},
		{
			"id": "musique-batterie-basse",
			"category": "musique",
			"a": {
				"name": "Batterie",
				"origin": "Le garage",
				"line": "Tape fort, compte jusqu’à quatre.",
				"giphyIds": [],
				"giphyQuery": "drummer"
			},
			"b": {
				"name": "Basse",
				"origin": "Le fond de la scène",
				"line": "Personne ne l’entend, tout le monde la sent.",
				"giphyIds": [],
				"giphyQuery": "bass guitar"
			}
		},
		{
			"id": "musique-kiss-ac-dc",
			"category": "musique",
			"a": {
				"name": "Kiss",
				"origin": "New York · 1973",
				"line": "Du maquillage, des flammes, et une très longue langue.",
				"giphyIds": [],
				"giphyQuery": "Kiss band"
			},
			"b": {
				"name": "AC/DC",
				"origin": "Sydney · 1973",
				"line": "Un uniforme d’écolier et des riffs éternels.",
				"giphyIds": [],
				"giphyQuery": "ACDC Angus Young"
			}
		},
		{
			"id": "musique-metallica-iron-maiden",
			"category": "musique",
			"a": {
				"name": "Metallica",
				"origin": "Los Angeles · 1981",
				"line": "Le metal, version stade.",
				"giphyIds": [],
				"giphyQuery": "Metallica"
			},
			"b": {
				"name": "Iron Maiden",
				"origin": "Londres · 1975",
				"line": "Une mascotte zombie et des solos interminables.",
				"giphyIds": [],
				"giphyQuery": "Iron Maiden Eddie"
			}
		},
		{
			"id": "musique-rihanna-dua-lipa",
			"category": "musique",
			"a": {
				"name": "Rihanna",
				"origin": "Barbade · 2005",
				"line": "Sous son parapluie, à la tête d’un empire.",
				"giphyIds": [],
				"giphyQuery": "Rihanna"
			},
			"b": {
				"name": "Dua Lipa",
				"origin": "Londres · 2015",
				"line": "De nouvelles règles, et des tubes disco.",
				"giphyIds": [],
				"giphyQuery": "Dua Lipa"
			}
		},
		{
			"id": "musique-billie-eilish-olivia-rodrigo",
			"category": "musique",
			"a": {
				"name": "Billie Eilish",
				"origin": "Los Angeles · 2015",
				"line": "Chuchote, et le monde entier écoute.",
				"giphyIds": [],
				"giphyQuery": "Billie Eilish"
			},
			"b": {
				"name": "Olivia Rodrigo",
				"origin": "Californie · 2021",
				"line": "Un permis de conduire, et un cœur brisé en chanson.",
				"giphyIds": [],
				"giphyQuery": "Olivia Rodrigo"
			}
		},
		{
			"id": "musique-ed-sheeran-bruno-mars",
			"category": "musique",
			"a": {
				"name": "Ed Sheeran",
				"origin": "Royaume-Uni · 2011",
				"line": "Une guitare, une pédale de boucle, et des stades.",
				"giphyIds": [],
				"giphyQuery": "Ed Sheeran"
			},
			"b": {
				"name": "Bruno Mars",
				"origin": "Hawaï · 2010",
				"line": "Le groove, le chapeau, et la danse.",
				"giphyIds": [],
				"giphyQuery": "Bruno Mars"
			}
		},
		{
			"id": "musique-musique-d-ascenseur-musique-d-attente",
			"category": "musique",
			"a": {
				"name": "Musique d’ascenseur",
				"origin": "L’ascenseur",
				"line": "Apaisante, et pourtant on veut sortir.",
				"giphyIds": [],
				"giphyQuery": "elevator music"
			},
			"b": {
				"name": "Musique d’attente",
				"origin": "Le service client",
				"line": "« Votre appel est important pour nous. » Depuis quarante minutes.",
				"giphyIds": [],
				"giphyQuery": "on hold phone waiting"
			}
		},
		{
			"id": "musique-tube-de-l-ete-chanson-de-noel",
			"category": "musique",
			"a": {
				"name": "Tube de l’été",
				"origin": "Juillet-août",
				"line": "Dansé en juillet, détesté en septembre.",
				"giphyIds": [],
				"giphyQuery": "summer dance party"
			},
			"b": {
				"name": "Chanson de Noël",
				"origin": "Décembre",
				"line": "Revient chaque année, que tu le veuilles ou non.",
				"giphyIds": [],
				"giphyQuery": "christmas song"
			}
		},
		{
			"id": "musique-rap-francais-rap-americain",
			"category": "musique",
			"a": {
				"name": "Rap français",
				"origin": "France",
				"line": "Des punchlines et beaucoup de verlan.",
				"giphyIds": [],
				"giphyQuery": "french rap"
			},
			"b": {
				"name": "Rap américain",
				"origin": "États-Unis",
				"line": "Des chaînes en or et de très grosses voitures.",
				"giphyIds": [],
				"giphyQuery": "rapper gold chain"
			}
		},
		{
			"id": "musique-playback-live",
			"category": "musique",
			"a": {
				"name": "Playback",
				"origin": "Le plateau télé",
				"line": "Zéro fausse note, zéro risque.",
				"giphyIds": [],
				"giphyQuery": "lip sync"
			},
			"b": {
				"name": "Live",
				"origin": "La scène",
				"line": "Des fausses notes, et c’est ça qui est beau.",
				"giphyIds": [],
				"giphyQuery": "live concert singer"
			}
		},
		{
			"id": "musique-freddie-mercury-david-bowie",
			"category": "musique",
			"a": {
				"name": "Freddie Mercury",
				"origin": "Queen · 1970",
				"line": "Une moustache, un débardeur, et quatre octaves.",
				"giphyIds": [],
				"giphyQuery": "Freddie Mercury"
			},
			"b": {
				"name": "David Bowie",
				"origin": "Londres · 1964",
				"line": "Un éclair sur le visage, et mille personnages.",
				"giphyIds": [],
				"giphyQuery": "David Bowie"
			}
		},
		{
			"id": "musique-les-enfoires-star-academy",
			"category": "musique",
			"a": {
				"name": "Les Enfoirés",
				"origin": "Depuis 1989",
				"line": "Des stars, des chansons, et des costumes improbables.",
				"giphyIds": [],
				"giphyQuery": "Les Enfoires"
			},
			"b": {
				"name": "Star Academy",
				"origin": "TF1 · 2001",
				"line": "Un château, des cours de chant, et des larmes.",
				"giphyIds": ["oMGTNu1MzJBVQeX78n"],
				"giphyQuery": "Star Academy"
			}
		},
		{
			"id": "dessins-les-simpson-les-griffin",
			"category": "dessins",
			"a": {
				"name": "Les Simpson",
				"origin": "Matt Groening · 1989",
				"line": "Plus de trente saisons et ils ont toujours le même âge.",
				"giphyIds": [],
				"giphyQuery": "The Simpsons"
			},
			"b": {
				"name": "Les Griffin",
				"origin": "Seth MacFarlane · 1999",
				"line": "Des digressions, un chien qui parle, un bébé qui complote.",
				"giphyIds": [],
				"giphyQuery": "Family Guy"
			}
		},
		{
			"id": "dessins-bip-bip-vil-coyote",
			"category": "dessins",
			"a": {
				"name": "Bip Bip",
				"origin": "Warner · 1949",
				"line": "Bip bip. Et il est déjà loin.",
				"giphyIds": [],
				"giphyQuery": "Road Runner"
			},
			"b": {
				"name": "Vil Coyote",
				"origin": "Warner · 1949",
				"line": "Client fidèle de la marque ACME.",
				"giphyIds": [],
				"giphyQuery": "Wile E Coyote"
			}
		},
		{
			"id": "dessins-titi-grosminet",
			"category": "dessins",
			"a": {
				"name": "Titi",
				"origin": "Warner · 1942",
				"line": "« J’ai cru voir un rominet ! »",
				"giphyIds": [],
				"giphyQuery": "Tweety bird"
			},
			"b": {
				"name": "Grosminet",
				"origin": "Warner · 1945",
				"line": "Toujours affamé, jamais rassasié.",
				"giphyIds": [],
				"giphyQuery": "Sylvester cat"
			}
		},
		{
			"id": "dessins-bugs-bunny-daffy-duck",
			"category": "dessins",
			"a": {
				"name": "Bugs Bunny",
				"origin": "Warner · 1940",
				"line": "« Quoi de neuf, docteur ? »",
				"giphyIds": [],
				"giphyQuery": "Bugs Bunny"
			},
			"b": {
				"name": "Daffy Duck",
				"origin": "Warner · 1937",
				"line": "Un canard qui postillonne et qui perd toujours.",
				"giphyIds": [],
				"giphyQuery": "Daffy Duck"
			}
		},
		{
			"id": "dessins-mickey-donald",
			"category": "dessins",
			"a": {
				"name": "Mickey",
				"origin": "Disney · 1928",
				"line": "Le patron de l’empire, en short rouge.",
				"giphyIds": [],
				"giphyQuery": "Mickey Mouse"
			},
			"b": {
				"name": "Donald",
				"origin": "Disney · 1934",
				"line": "Râle tout le temps, et personne ne comprend ce qu’il dit.",
				"giphyIds": [],
				"giphyQuery": "Donald Duck angry"
			}
		},
		{
			"id": "dessins-pokemon-digimon",
			"category": "dessins",
			"a": {
				"name": "Pokémon",
				"origin": "Anime · 1997",
				"line": "Attrapez-les tous.",
				"giphyIds": [],
				"giphyQuery": "Pokemon anime"
			},
			"b": {
				"name": "Digimon",
				"origin": "Anime · 1999",
				"line": "Ils évoluent aussi, mais en criant plus fort.",
				"giphyIds": [],
				"giphyQuery": "Digimon"
			}
		},
		{
			"id": "dessins-dragon-ball-one-piece",
			"category": "dessins",
			"a": {
				"name": "Dragon Ball",
				"origin": "Akira Toriyama · 1984",
				"line": "Sept boules, un dragon, et des cris qui durent trois épisodes.",
				"giphyIds": [],
				"giphyQuery": "Dragon Ball"
			},
			"b": {
				"name": "One Piece",
				"origin": "Eiichiro Oda · 1997",
				"line": "Un chapeau de paille et plus de mille épisodes.",
				"giphyIds": [],
				"giphyQuery": "One Piece Luffy"
			}
		},
		{
			"id": "dessins-disney-studio-ghibli",
			"category": "dessins",
			"a": {
				"name": "Disney",
				"origin": "Blanche-Neige · 1937",
				"line": "Une souris, un château, et une chanson qui ne sort plus de ta tête.",
				"giphyIds": [],
				"giphyQuery": "Disney animation"
			},
			"b": {
				"name": "Studio Ghibli",
				"origin": "Tokyo · 1985",
				"line": "Des esprits, du vent dans les herbes, et des repas qui donnent faim.",
				"giphyIds": [],
				"giphyQuery": "Studio Ghibli"
			}
		},
		{
			"id": "dessins-totoro-le-chatbus",
			"category": "dessins",
			"a": {
				"name": "Totoro",
				"origin": "Mon voisin Totoro · 1988",
				"line": "Une grosse boule de poils qui attend le bus.",
				"giphyIds": [],
				"giphyQuery": "Totoro"
			},
			"b": {
				"name": "Le Chatbus",
				"origin": "Mon voisin Totoro · 1988",
				"line": "Un bus. Un chat. Douze pattes.",
				"giphyIds": [],
				"giphyQuery": "Catbus Totoro"
			}
		},
		{
			"id": "dessins-goldorak-albator",
			"category": "dessins",
			"a": {
				"name": "Goldorak",
				"origin": "Go Nagai · 1975",
				"line": "« Fulguropoing ! »",
				"giphyIds": [],
				"giphyQuery": "Grendizer"
			},
			"b": {
				"name": "Albator",
				"origin": "Leiji Matsumoto · 1977",
				"line": "Une cape, une balafre, et un vaisseau à tête de mort.",
				"giphyIds": [],
				"giphyQuery": "Captain Harlock"
			}
		},
		{
			"id": "dessins-les-schtroumpfs-les-bisounours",
			"category": "dessins",
			"a": {
				"name": "Les Schtroumpfs",
				"origin": "Peyo · 1958",
				"line": "Tout bleus, et schtroumpfement joyeux.",
				"giphyIds": ["11nasKvU7ANSEw"],
				"giphyQuery": "Smurfs"
			},
			"b": {
				"name": "Les Bisounours",
				"origin": "États-Unis · 1981",
				"line": "Un câlin, et un arc-en-ciel sur le ventre.",
				"giphyIds": [],
				"giphyQuery": "Care Bears"
			}
		},
		{
			"id": "dessins-scooby-doo-inspecteur-gadget",
			"category": "dessins",
			"a": {
				"name": "Scooby-Doo",
				"origin": "Hanna-Barbera · 1969",
				"line": "Mène l’enquête pour des biscuits.",
				"giphyIds": [],
				"giphyQuery": "Scooby Doo"
			},
			"b": {
				"name": "Inspecteur Gadget",
				"origin": "DIC · 1983",
				"line": "« Go go gadgeto ! »",
				"giphyIds": [],
				"giphyQuery": "Inspector Gadget"
			}
		},
		{
			"id": "dessins-ulysse-31-les-mysterieuses-cites-d-or",
			"category": "dessins",
			"a": {
				"name": "Ulysse 31",
				"origin": "Série animée · 1981",
				"line": "L’Odyssée, dans l’espace, avec un robot.",
				"giphyIds": [],
				"giphyQuery": "Ulysses 31"
			},
			"b": {
				"name": "Les Mystérieuses Cités d’or",
				"origin": "Série animée · 1982",
				"line": "Esteban, Zia, Tao, et un condor en or.",
				"giphyIds": [],
				"giphyQuery": "Mysterious Cities of Gold",
				"gifUrls": ["https://media.tenor.com/JW79lNecXjsAAAAC/grandcondor.gif"]
			}
		},
		{
			"id": "dessins-il-etait-une-fois-la-vie-il-etait-une-fois-l-homme",
			"category": "dessins",
			"a": {
				"name": "Il était une fois… la vie",
				"origin": "Albert Barillé · 1987",
				"line": "Des globules blancs en uniforme.",
				"giphyIds": ["acngmt1o5atVMEebXF"],
				"giphyQuery": "Hello Maestro"
			},
			"b": {
				"name": "Il était une fois… l’homme",
				"origin": "Albert Barillé · 1978",
				"line": "Maestro et sa très longue barbe.",
				"giphyIds": ["HRvcfB6kn3wYOtFf18"],
				"giphyQuery": "Once Upon a Time Man"
			}
		},
		{
			"id": "dessins-les-tortues-ninja-musclor",
			"category": "dessins",
			"a": {
				"name": "Les Tortues Ninja",
				"origin": "Série animée · 1987",
				"line": "Quatre tortues, des pizzas, et les égouts.",
				"giphyIds": [],
				"giphyQuery": "Teenage Mutant Ninja Turtles"
			},
			"b": {
				"name": "Musclor",
				"origin": "Les Maîtres de l’univers · 1983",
				"line": "« Par le pouvoir du crâne ancestral ! »",
				"giphyIds": [],
				"giphyQuery": "He-Man"
			}
		},
		{
			"id": "dessins-totally-spies-les-supers-nanas",
			"category": "dessins",
			"a": {
				"name": "Totally Spies",
				"origin": "Marathon · 2001",
				"line": "Trois espionnes et des gadgets déguisés en sèche-cheveux.",
				"giphyIds": [],
				"giphyQuery": "Totally Spies"
			},
			"b": {
				"name": "Les Supers Nanas",
				"origin": "Cartoon Network · 1998",
				"line": "Du sucre, des épices, et l’ingrédient X.",
				"giphyIds": [],
				"giphyQuery": "Powerpuff Girls"
			}
		},
		{
			"id": "dessins-oggy-et-les-cafards-zig-et-sharko",
			"category": "dessins",
			"a": {
				"name": "Oggy et les Cafards",
				"origin": "Xilam · 1998",
				"line": "Un chat bleu, trois cafards, zéro répit.",
				"giphyIds": ["InHHbyimzP1uCR8cJb"],
				"giphyQuery": "Oggy and the Cockroaches"
			},
			"b": {
				"name": "Zig et Sharko",
				"origin": "Xilam · 2010",
				"line": "Une hyène, un requin, une sirène, et des plans foireux.",
				"giphyIds": ["7sCEyMcmmXgzc46Pi5"],
				"giphyQuery": "Zig and Sharko"
			}
		},
		{
			"id": "dessins-les-razmoket-doug",
			"category": "dessins",
			"a": {
				"name": "Les Razmoket",
				"origin": "Nickelodeon · 1991",
				"line": "Des bébés qui en savent plus que les adultes.",
				"giphyIds": [],
				"giphyQuery": "Rugrats"
			},
			"b": {
				"name": "Doug",
				"origin": "Nickelodeon · 1991",
				"line": "Un journal intime, un chien, et beaucoup d’angoisse.",
				"giphyIds": [],
				"giphyQuery": "Doug Funnie"
			}
		},
		{
			"id": "dessins-batman-la-serie-animee-spider-man-la-serie-animee",
			"category": "dessins",
			"a": {
				"name": "Batman, la série animée",
				"origin": "Warner · 1992",
				"line": "Gotham, la nuit, et un générique génial.",
				"giphyIds": [],
				"giphyQuery": "Batman animated series"
			},
			"b": {
				"name": "Spider-Man, la série animée",
				"origin": "Marvel · 1994",
				"line": "Le tisseur, version années 90.",
				"giphyIds": [],
				"giphyQuery": "Spider-Man animated series 1994"
			}
		},
		{
			"id": "dessins-avatar-le-dernier-maitre-de-l-ai-la-legende-de-korra",
			"category": "dessins",
			"a": {
				"name": "Avatar, le dernier maître de l’air",
				"origin": "Nickelodeon · 2005",
				"line": "Quatre éléments, et une flèche sur le crâne.",
				"giphyIds": [],
				"giphyQuery": "Avatar Aang"
			},
			"b": {
				"name": "La Légende de Korra",
				"origin": "Nickelodeon · 2012",
				"line": "Plus âgée, plus rapide, plus têtue.",
				"giphyIds": [],
				"giphyQuery": "Legend of Korra"
			}
		},
		{
			"id": "dessins-futurama-south-park",
			"category": "dessins",
			"a": {
				"name": "Futurama",
				"origin": "Matt Groening · 1999",
				"line": "L’an 3000, et toujours des livreurs mal payés.",
				"giphyIds": [],
				"giphyQuery": "Futurama"
			},
			"b": {
				"name": "South Park",
				"origin": "Comedy Central · 1997",
				"line": "Quatre gamins, beaucoup de gros mots.",
				"giphyIds": [],
				"giphyQuery": "South Park"
			}
		},
		{
			"id": "dessins-gravity-falls-adventure-time",
			"category": "dessins",
			"a": {
				"name": "Gravity Falls",
				"origin": "Disney · 2012",
				"line": "Des mystères, des codes secrets, un été bizarre.",
				"giphyIds": [],
				"giphyQuery": "Gravity Falls"
			},
			"b": {
				"name": "Adventure Time",
				"origin": "Cartoon Network · 2010",
				"line": "Un chien élastique et un garçon au bonnet.",
				"giphyIds": [],
				"giphyQuery": "Adventure Time"
			}
		},
		{
			"id": "dessins-les-aristochats-les-101-dalmatiens",
			"category": "dessins",
			"a": {
				"name": "Les Aristochats",
				"origin": "Disney · 1970",
				"line": "Tout le monde veut devenir un chat.",
				"giphyIds": [],
				"giphyQuery": "Aristocats"
			},
			"b": {
				"name": "Les 101 Dalmatiens",
				"origin": "Disney · 1961",
				"line": "Beaucoup de taches, et Cruella.",
				"giphyIds": [],
				"giphyQuery": "101 Dalmatians"
			}
		},
		{
			"id": "dessins-le-roi-lion-le-livre-de-la-jungle",
			"category": "dessins",
			"a": {
				"name": "Le Roi lion",
				"origin": "Disney · 1994",
				"line": "« Hakuna matata. »",
				"giphyIds": [],
				"giphyQuery": "Lion King"
			},
			"b": {
				"name": "Le Livre de la jungle",
				"origin": "Disney · 1967",
				"line": "Il en faut peu pour être heureux.",
				"giphyIds": [],
				"giphyQuery": "Jungle Book Baloo"
			}
		},
		{
			"id": "dessins-aladdin-la-belle-et-la-bete",
			"category": "dessins",
			"a": {
				"name": "Aladdin",
				"origin": "Disney · 1992",
				"line": "Un tapis, une lampe, trois vœux.",
				"giphyIds": [],
				"giphyQuery": "Aladdin Disney"
			},
			"b": {
				"name": "La Belle et la Bête",
				"origin": "Disney · 1991",
				"line": "Une bibliothèque immense, et un chandelier bavard.",
				"giphyIds": [],
				"giphyQuery": "Beauty and the Beast Disney"
			}
		},
		{
			"id": "dessins-mulan-vaiana",
			"category": "dessins",
			"a": {
				"name": "Mulan",
				"origin": "Disney · 1998",
				"line": "Sauve la Chine, déguisée en soldat.",
				"giphyIds": [],
				"giphyQuery": "Mulan Disney"
			},
			"b": {
				"name": "Vaiana",
				"origin": "Disney · 2016",
				"line": "Traverse l’océan avec un coq pas très malin.",
				"giphyIds": [],
				"giphyQuery": "Moana"
			}
		},
		{
			"id": "dessins-elsa-anna",
			"category": "dessins",
			"a": {
				"name": "Elsa",
				"origin": "La Reine des neiges · 2013",
				"line": "« Libérée, délivrée. »",
				"giphyIds": [],
				"giphyQuery": "Elsa Frozen"
			},
			"b": {
				"name": "Anna",
				"origin": "La Reine des neiges · 2013",
				"line": "Tombe amoureuse en une chanson.",
				"giphyIds": [],
				"giphyQuery": "Anna Frozen"
			}
		},
		{
			"id": "dessins-l-age-de-glace-madagascar",
			"category": "dessins",
			"a": {
				"name": "L’Âge de glace",
				"origin": "Blue Sky · 2002",
				"line": "Un écureuil, un gland, et une obsession.",
				"giphyIds": [],
				"giphyQuery": "Ice Age Scrat"
			},
			"b": {
				"name": "Madagascar",
				"origin": "DreamWorks · 2005",
				"line": "Des animaux du zoo, et des pingouins très organisés.",
				"giphyIds": [],
				"giphyQuery": "Madagascar penguins"
			}
		},
		{
			"id": "dessins-monstres-et-cie-le-monde-de-nemo",
			"category": "dessins",
			"a": {
				"name": "Monstres et Cie",
				"origin": "Pixar · 2001",
				"line": "Ils font peur aux enfants. Pour l’électricité.",
				"giphyIds": [],
				"giphyQuery": "Monsters Inc"
			},
			"b": {
				"name": "Le Monde de Nemo",
				"origin": "Pixar · 2003",
				"line": "« Continue de nager. »",
				"giphyIds": [],
				"giphyQuery": "Finding Nemo Dory"
			}
		},
		{
			"id": "dessins-les-indestructibles-ratatouille",
			"category": "dessins",
			"a": {
				"name": "Les Indestructibles",
				"origin": "Pixar · 2004",
				"line": "« Pas de cape ! »",
				"giphyIds": [],
				"giphyQuery": "The Incredibles"
			},
			"b": {
				"name": "Ratatouille",
				"origin": "Pixar · 2007",
				"line": "Un rat chef cuisinier, à Paris.",
				"giphyIds": [],
				"giphyQuery": "Ratatouille"
			}
		},
		{
			"id": "dessins-chicken-run-shaun-le-mouton",
			"category": "dessins",
			"a": {
				"name": "Chicken Run",
				"origin": "Aardman · 2000",
				"line": "Des poules qui préparent la grande évasion.",
				"giphyIds": [],
				"giphyQuery": "Chicken Run"
			},
			"b": {
				"name": "Shaun le mouton",
				"origin": "Aardman · 2007",
				"line": "Un mouton plus malin que le fermier.",
				"giphyIds": [],
				"giphyQuery": "Shaun the Sheep"
			}
		},
		{
			"id": "dessins-les-minions-les-lapins-cretins",
			"category": "dessins",
			"a": {
				"name": "Les Minions",
				"origin": "Moi, moche et méchant · 2010",
				"line": "Jaunes, en salopette, fous de bananes.",
				"giphyIds": [],
				"giphyQuery": "Minions"
			},
			"b": {
				"name": "Les Lapins Crétins",
				"origin": "Ubisoft · 2006",
				"line": "« Bwaaaah ! »",
				"giphyIds": [],
				"giphyQuery": "Rabbids"
			}
		},
		{
			"id": "dessins-kirikou-les-triplettes-de-belleville",
			"category": "dessins",
			"a": {
				"name": "Kirikou",
				"origin": "Michel Ocelot · 1998",
				"line": "Petit, rapide, et plus malin que la sorcière.",
				"giphyIds": ["MSRLPAkKlbFkzTD7Tb"],
				"giphyQuery": "Kirikou"
			},
			"b": {
				"name": "Les Triplettes de Belleville",
				"origin": "Sylvain Chomet · 2003",
				"line": "Trois chanteuses, un chien, et le Tour de France.",
				"giphyIds": [],
				"giphyQuery": "Triplets of Belleville",
				"gifUrls": ["https://media.tenor.com/l0uAdKxkKcsAAAAC/triplets-belleville.gif"]
			}
		},
		{
			"id": "dessins-peppa-pig-t-choupi",
			"category": "dessins",
			"a": {
				"name": "Peppa Pig",
				"origin": "Royaume-Uni · 2004",
				"line": "Saute dans les flaques de boue. Toujours.",
				"giphyIds": [],
				"giphyQuery": "Peppa Pig"
			},
			"b": {
				"name": "T’choupi",
				"origin": "France · 1992",
				"line": "Un petit pingouin qui découvre la vie, tranquillement.",
				"giphyIds": [],
				"giphyQuery": "Tchoupi penguin"
			}
		},
		{
			"id": "dessins-la-pat-patrouille-pyjamasques",
			"category": "dessins",
			"a": {
				"name": "La Pat’ Patrouille",
				"origin": "Nickelodeon · 2013",
				"line": "Six chiots, et un budget illimité.",
				"giphyIds": [],
				"giphyQuery": "Paw Patrol"
			},
			"b": {
				"name": "Pyjamasques",
				"origin": "Série animée · 2015",
				"line": "Super-héros la nuit, élèves fatigués le jour.",
				"giphyIds": [],
				"giphyQuery": "PJ Masks"
			}
		},
		{
			"id": "dessins-garfield-snoopy",
			"category": "dessins",
			"a": {
				"name": "Garfield",
				"origin": "Jim Davis · 1978",
				"line": "Déteste les lundis, adore les lasagnes.",
				"giphyIds": [],
				"giphyQuery": "Garfield"
			},
			"b": {
				"name": "Snoopy",
				"origin": "Charles Schulz · 1950",
				"line": "Dort sur le toit de sa niche.",
				"giphyIds": [],
				"giphyQuery": "Snoopy"
			}
		},
		{
			"id": "dessins-lucky-luke-rantanplan",
			"category": "dessins",
			"a": {
				"name": "Lucky Luke",
				"origin": "Morris · 1946",
				"line": "Tire plus vite que son ombre.",
				"giphyIds": ["7npgNtSclhnP2"],
				"giphyQuery": "Lucky Luke"
			},
			"b": {
				"name": "Rantanplan",
				"origin": "Morris · 1960",
				"line": "Le chien le plus bête de l’Ouest.",
				"giphyIds": [],
				"giphyQuery": "Rantanplan dog",
				"gifUrls": ["https://media.tenor.com/t4BnfY4XOQsAAAAC/dog-rintindumb.gif"]
			}
		},
		{
			"id": "dessins-barbapapa-casimir",
			"category": "dessins",
			"a": {
				"name": "Barbapapa",
				"origin": "Annette Tison et Talus Taylor · 1970",
				"line": "Change de forme, mais reste rose.",
				"giphyIds": [],
				"giphyQuery": "Barbapapa"
			},
			"b": {
				"name": "Casimir",
				"origin": "L’Île aux enfants · 1974",
				"line": "Un dinosaure orange, et du gloubi-boulga.",
				"giphyIds": [],
				"giphyQuery": "Casimir dinosaur",
				"gifUrls": ["https://media.tenor.com/e85q0CTgsOEAAAAC/casimir.gif"]
			}
		},
		{
			"id": "dessins-kung-fu-panda-dragons",
			"category": "dessins",
			"a": {
				"name": "Kung Fu Panda",
				"origin": "DreamWorks · 2008",
				"line": "Un panda, des raviolis, et le kung-fu.",
				"giphyIds": [],
				"giphyQuery": "Kung Fu Panda"
			},
			"b": {
				"name": "Dragons",
				"origin": "DreamWorks · 2010",
				"line": "Un Viking, et son dragon noir, Krokmou.",
				"giphyIds": [],
				"giphyQuery": "How to Train Your Dragon Toothless"
			}
		},
		{
			"id": "dessins-he-arnold-daria",
			"category": "dessins",
			"a": {
				"name": "Hé Arnold !",
				"origin": "Nickelodeon · 1996",
				"line": "Une tête en forme de ballon de rugby.",
				"giphyIds": [],
				"giphyQuery": "Hey Arnold"
			},
			"b": {
				"name": "Daria",
				"origin": "MTV · 1997",
				"line": "Blasée, lucide, et des lunettes rondes.",
				"giphyIds": [],
				"giphyQuery": "Daria"
			}
		},
		{
			"id": "dessins-ben-10-danny-fantome",
			"category": "dessins",
			"a": {
				"name": "Ben 10",
				"origin": "Cartoon Network · 2005",
				"line": "Une montre, dix aliens.",
				"giphyIds": [],
				"giphyQuery": "Ben 10"
			},
			"b": {
				"name": "Danny Fantôme",
				"origin": "Nickelodeon · 2004",
				"line": "Moitié ado, moitié fantôme.",
				"giphyIds": [],
				"giphyQuery": "Danny Phantom"
			}
		},
		{
			"id": "dessins-code-lyoko-wakfu",
			"category": "dessins",
			"a": {
				"name": "Code Lyoko",
				"origin": "France · 2003",
				"line": "Sauver le monde virtuel après les cours.",
				"giphyIds": [],
				"giphyQuery": "Code Lyoko"
			},
			"b": {
				"name": "Wakfu",
				"origin": "Ankama · 2008",
				"line": "Un chapeau, des portails, et des larmes.",
				"giphyIds": ["N8wxYjgqOfxvi"],
				"giphyQuery": "Wakfu"
			}
		},
		{
			"id": "dessins-sailor-moon-card-captor-sakura",
			"category": "dessins",
			"a": {
				"name": "Sailor Moon",
				"origin": "Naoko Takeuchi · 1992",
				"line": "« Au nom de la Lune, je vais te punir ! »",
				"giphyIds": [],
				"giphyQuery": "Sailor Moon"
			},
			"b": {
				"name": "Card Captor Sakura",
				"origin": "CLAMP · 1996",
				"line": "Des cartes magiques et une meilleure amie couturière.",
				"giphyIds": [],
				"giphyQuery": "Cardcaptor Sakura"
			}
		},
		{
			"id": "dessins-hamtaro-doraemon",
			"category": "dessins",
			"a": {
				"name": "Hamtaro",
				"origin": "Ritsuko Kawai · 1997",
				"line": "Un hamster, des graines de tournesol, des copains.",
				"giphyIds": [],
				"giphyQuery": "Hamtaro"
			},
			"b": {
				"name": "Doraemon",
				"origin": "Fujiko F. Fujio · 1969",
				"line": "Un chat-robot avec une poche magique.",
				"giphyIds": [],
				"giphyQuery": "Doraemon"
			}
		},
		{
			"id": "dessins-nicky-larson-cobra",
			"category": "dessins",
			"a": {
				"name": "Nicky Larson",
				"origin": "Tsukasa Hojo · 1985",
				"line": "Détective de génie, dragueur catastrophique.",
				"giphyIds": [],
				"giphyQuery": "City Hunter"
			},
			"b": {
				"name": "Cobra",
				"origin": "Buichi Terasawa · 1978",
				"line": "Un rayon psychique caché dans le bras gauche.",
				"giphyIds": [],
				"giphyQuery": "Space Adventure Cobra"
			}
		},
		{
			"id": "dessins-les-chevaliers-du-zodiaque-ken-le-survivant",
			"category": "dessins",
			"a": {
				"name": "Les Chevaliers du Zodiaque",
				"origin": "Masami Kurumada · 1986",
				"line": "Des armures, des constellations, et beaucoup de cris.",
				"giphyIds": [],
				"giphyQuery": "Saint Seiya"
			},
			"b": {
				"name": "Ken le Survivant",
				"origin": "Buronson et Tetsuo Hara · 1983",
				"line": "« Tu ne le sais pas encore, mais tu es déjà mort. »",
				"giphyIds": [],
				"giphyQuery": "Fist of the North Star"
			}
		},
		{
			"id": "dessins-candy-princesse-sarah",
			"category": "dessins",
			"a": {
				"name": "Candy",
				"origin": "Kyoko Mizuki · 1975",
				"line": "Pleure beaucoup, se relève toujours.",
				"giphyIds": [],
				"giphyQuery": "Candy Candy"
			},
			"b": {
				"name": "Princesse Sarah",
				"origin": "Série animée · 1985",
				"line": "Riche, puis pauvre, puis riche. Courage.",
				"giphyIds": [],
				"giphyQuery": "Princess Sarah anime"
			}
		},
		{
			"id": "dessins-olive-et-tom-jeanne-et-serge",
			"category": "dessins",
			"a": {
				"name": "Olive et Tom",
				"origin": "Yoichi Takahashi · 1981",
				"line": "Un terrain de foot de dix kilomètres de long.",
				"giphyIds": [],
				"giphyQuery": "Captain Tsubasa"
			},
			"b": {
				"name": "Jeanne et Serge",
				"origin": "Série animée · 1984",
				"line": "Le volley, version passion.",
				"giphyIds": [],
				"giphyQuery": "volleyball anime",
				"gifUrls": ["https://media.tenor.com/bhL2NR4Os00AAAAC/jeanne%26serge-jeanne-et-serge.gif"]
			}
		},
		{
			"id": "dessins-bambi-dumbo",
			"category": "dessins",
			"a": {
				"name": "Bambi",
				"origin": "Disney · 1942",
				"line": "Apprend à marcher sur la glace. Puis le drame.",
				"giphyIds": [],
				"giphyQuery": "Bambi"
			},
			"b": {
				"name": "Dumbo",
				"origin": "Disney · 1941",
				"line": "De grandes oreilles, et un grand destin.",
				"giphyIds": [],
				"giphyQuery": "Dumbo"
			}
		},
		{
			"id": "dessins-coraline-l-etrange-noel-de-m-jack",
			"category": "dessins",
			"a": {
				"name": "Coraline",
				"origin": "Henry Selick · 2009",
				"line": "Une autre mère, avec des boutons à la place des yeux.",
				"giphyIds": [],
				"giphyQuery": "Coraline"
			},
			"b": {
				"name": "L’Étrange Noël de M. Jack",
				"origin": "Henry Selick · 1993",
				"line": "Halloween veut faire Noël. Ça se passe moyennement.",
				"giphyIds": [],
				"giphyQuery": "Nightmare Before Christmas Jack"
			}
		},
		{
			"id": "cinefr-louis-de-funes-bourvil",
			"category": "cinefr",
			"a": {
				"name": "Louis de Funès",
				"origin": "Le Corniaud · 1965",
				"line": "Mille grimaces à la minute.",
				"giphyIds": ["G5CoKPt7xtiI8"],
				"giphyQuery": "Louis de Funes"
			},
			"b": {
				"name": "Bourvil",
				"origin": "La Grande Vadrouille · 1966",
				"line": "Le gentil qui s’en sort quand même.",
				"giphyIds": [],
				"giphyQuery": "Bourvil",
				"gifUrls": ["https://media.tenor.com/_2Iwv1Tc7cgAAAAC/y%27a-quelqu%27un-il-y-a-quelqu%27un.gif"]
			}
		},
		{
			"id": "cinefr-les-bronzes-le-pere-noel-est-une-ordure",
			"category": "cinefr",
			"a": {
				"name": "Les Bronzés",
				"origin": "Patrice Leconte · 1978",
				"line": "Le Club Med, version catastrophe.",
				"giphyIds": [],
				"giphyQuery": "Les Bronzes",
				"gifUrls": ["https://media.tenor.com/bsd1hzZExBMAAAAC/michel-blanc-beach.gif"]
			},
			"b": {
				"name": "Le Père Noël est une ordure",
				"origin": "Jean-Marie Poiré · 1982",
				"line": "Un réveillon de Noël qui tourne mal. Très mal.",
				"giphyIds": [],
				"giphyQuery": "Le Pere Noel est une ordure",
				"gifUrls": ["https://media.tenor.com/EybmJtQ8b6AAAAAC/le-pere-noel-est-une-ordure-thierry-lhermitte.gif"]
			}
		},
		{
			"id": "cinefr-oss-117-le-caire-nid-d-espions-asterix-mission-cleopatre",
			"category": "cinefr",
			"a": {
				"name": "OSS 117, Le Caire nid d’espions",
				"origin": "Michel Hazanavicius · 2006",
				"line": "Un espion sûr de lui, et très souvent à côté.",
				"giphyIds": ["3o7bufRpr472fizpHa"],
				"giphyQuery": "OSS 117"
			},
			"b": {
				"name": "Astérix, Mission Cléopâtre",
				"origin": "Alain Chabat · 2002",
				"line": "« C’est une bonne situation, ça, scribe ? »",
				"giphyIds": ["7JsEoLWq836gidV6r5"],
				"giphyQuery": "Asterix Mission Cleopatre"
			}
		},
		{
			"id": "cinefr-le-diner-de-cons-la-cite-de-la-peur",
			"category": "cinefr",
			"a": {
				"name": "Le Dîner de cons",
				"origin": "Francis Veber · 1998",
				"line": "« Il s’appelle Juste Leblanc. »",
				"giphyIds": [],
				"giphyQuery": "Le Diner de cons",
				"gifUrls": ["https://media.tenor.com/mIDS6MKwGAUAAAAC/diner-cons.gif"]
			},
			"b": {
				"name": "La Cité de la peur",
				"origin": "Les Nuls · 1994",
				"line": "Un festival de Cannes et un tueur au marteau et à la faucille.",
				"giphyIds": ["3o751UakDjQQO6HjAQ"],
				"giphyQuery": "La Cite de la peur"
			}
		},
		{
			"id": "cinefr-les-visiteurs-les-bronzes-font-du-ski",
			"category": "cinefr",
			"a": {
				"name": "Les Visiteurs",
				"origin": "Jean-Marie Poiré · 1993",
				"line": "Un chevalier et son écuyer perdus en 1993.",
				"giphyIds": ["V98m5Xt9pf4xW"],
				"giphyQuery": "Les Visiteurs"
			},
			"b": {
				"name": "Les Bronzés font du ski",
				"origin": "Patrice Leconte · 1979",
				"line": "Le ski, la fondue, et la survie en montagne.",
				"giphyIds": ["bYAvC6WCKOAPGcWcEy"],
				"giphyQuery": "Les Bronzes font du ski"
			}
		},
		{
			"id": "cinefr-intouchables-bienvenue-chez-les-ch-tis",
			"category": "cinefr",
			"a": {
				"name": "Intouchables",
				"origin": "Olivier Nakache et Éric Toledano · 2011",
				"line": "Un milliardaire, un aide à domicile, et beaucoup de rires.",
				"giphyIds": ["9VvfZjzJJMHXF4cRN3"],
				"giphyQuery": "Intouchables"
			},
			"b": {
				"name": "Bienvenue chez les Ch’tis",
				"origin": "Dany Boon · 2008",
				"line": "« Biloute ! »",
				"giphyIds": [],
				"giphyQuery": "Bienvenue chez les Chtis",
				"gifUrls": ["https://media.tenor.com/RQbuAqBcF0sAAAAC/nord-chti.gif"]
			}
		},
		{
			"id": "cinefr-le-fabuleux-destin-d-amelie-poul-la-haine",
			"category": "cinefr",
			"a": {
				"name": "Le Fabuleux Destin d’Amélie Poulain",
				"origin": "Jean-Pierre Jeunet · 2001",
				"line": "Casser la croûte des crèmes brûlées.",
				"giphyIds": ["14fbNNlDpxjEnS"],
				"giphyQuery": "Amelie Poulain"
			},
			"b": {
				"name": "La Haine",
				"origin": "Mathieu Kassovitz · 1995",
				"line": "« Jusqu’ici, tout va bien. »",
				"giphyIds": ["88pDcmjlxXFoQ"],
				"giphyQuery": "La Haine"
			}
		},
		{
			"id": "cinefr-le-grand-bleu-leon",
			"category": "cinefr",
			"a": {
				"name": "Le Grand Bleu",
				"origin": "Luc Besson · 1988",
				"line": "Plonger toujours plus profond, avec des dauphins.",
				"giphyIds": [],
				"giphyQuery": "Le Grand Bleu",
				"gifUrls": ["https://media.tenor.com/70XZ75JE5YkAAAAC/le-grand-bleu-the-big-blue.gif"]
			},
			"b": {
				"name": "Léon",
				"origin": "Luc Besson · 1994",
				"line": "Un tueur, une plante verte, et un verre de lait.",
				"giphyIds": ["tCzWe3PQwJeuI"],
				"giphyQuery": "Leon the Professional"
			}
		},
		{
			"id": "cinefr-le-cinquieme-element-taxi",
			"category": "cinefr",
			"a": {
				"name": "Le Cinquième Élément",
				"origin": "Luc Besson · 1997",
				"line": "« Multipass ! »",
				"giphyIds": ["uIGHPjEfdc0Ni"],
				"giphyQuery": "Fifth Element multipass"
			},
			"b": {
				"name": "Taxi",
				"origin": "Gérard Pirès · 1998",
				"line": "Marseille en mode turbo.",
				"giphyIds": [],
				"giphyQuery": "Taxi film Marseille",
				"gifUrls": ["https://media.tenor.com/LaFq0vrUiJAAAAAC/taxi-start.gif"]
			}
		},
		{
			"id": "cinefr-jean-dujardin-jean-reno",
			"category": "cinefr",
			"a": {
				"name": "Jean Dujardin",
				"origin": "Brice de Nice, OSS 117",
				"line": "Des grimaces, des répliques, et un Oscar.",
				"giphyIds": ["qDJuQR8Xyt3ri"],
				"giphyQuery": "Jean Dujardin"
			},
			"b": {
				"name": "Jean Reno",
				"origin": "Léon, Les Visiteurs",
				"line": "Un regard grave et une voix encore plus grave.",
				"giphyIds": ["Pc16mmoHoXBh6"],
				"giphyQuery": "Jean Reno"
			}
		},
		{
			"id": "cinefr-les-tontons-flingueurs-la-grande-vadrouille",
			"category": "cinefr",
			"a": {
				"name": "Les Tontons flingueurs",
				"origin": "Georges Lautner · 1963",
				"line": "Des truands, une cuisine, et des dialogues d’Audiard.",
				"giphyIds": ["c6NoRjSwtP86Q"],
				"giphyQuery": "Les Tontons flingueurs"
			},
			"b": {
				"name": "La Grande Vadrouille",
				"origin": "Gérard Oury · 1966",
				"line": "Deux Français, des aviateurs anglais, et une course-poursuite.",
				"giphyIds": [],
				"giphyQuery": "defenus",
				"gifUrls": ["https://media.tenor.com/OL9_NJ1VlQgAAAAC/la-grande-vadrouille-ecoutez-mon-cher-dites-vous-bien-que-nous-ne-sommes-pas-du-meme-monde.gif"]
			}
		},
		{
			"id": "cinefr-la-soupe-aux-choux-le-gendarme-de-saint-tropez",
			"category": "cinefr",
			"a": {
				"name": "La Soupe aux choux",
				"origin": "Jean Girault · 1981",
				"line": "Un extraterrestre fan de soupe.",
				"giphyIds": [],
				"giphyQuery": "La Soupe aux choux",
				"gifUrls": ["https://media.tenor.com/bhZ8y9j-8jQAAAAC/defunes-villeret.gif"]
			},
			"b": {
				"name": "Le Gendarme de Saint-Tropez",
				"origin": "Jean Girault · 1964",
				"line": "Des gendarmes, la plage, et beaucoup d’agitation.",
				"giphyIds": ["yUXc5qUqmrdza"],
				"giphyQuery": "Gendarme de Saint-Tropez"
			}
		},
		{
			"id": "cinefr-brice-de-nice-les-tuche",
			"category": "cinefr",
			"a": {
				"name": "Brice de Nice",
				"origin": "James Huth · 2005",
				"line": "« Cassé ! »",
				"giphyIds": ["j8SjxLuHM3L32"],
				"giphyQuery": "Brice de Nice"
			},
			"b": {
				"name": "Les Tuche",
				"origin": "Olivier Baroux · 2011",
				"line": "Une famille qui gagne au loto et reste fidèle à elle-même.",
				"giphyIds": [],
				"giphyQuery": "Les Tuche",
				"gifUrls": ["https://media.tenor.com/c1bsf5k0QjwAAAAC/les-tuche-des-frites-des-frites-des-frites.gif"]
			}
		},
		{
			"id": "cinefr-camping-la-verite-si-je-mens",
			"category": "cinefr",
			"a": {
				"name": "Camping",
				"origin": "Fabien Onteniente · 2006",
				"line": "Patrick Chirac, au camping des Flots bleus, tous les étés.",
				"giphyIds": [],
				"giphyQuery": "Camping film Franck Dubosc",
				"gifUrls": ["https://media.tenor.com/1wLhaxTMpqAAAAAC/franck-dubosc-patrick.gif"]
			},
			"b": {
				"name": "La Vérité si je mens !",
				"origin": "Thomas Gilou · 1997",
				"line": "Le Sentier, des costumes, et des embrouilles.",
				"giphyIds": [],
				"giphyQuery": "La Verite si je mens",
				"gifUrls": ["https://media.tenor.com/5Tuf-Lz7IjMAAAAC/yallah-la-verite-si-je-mens.gif"]
			}
		},
		{
			"id": "cinefr-jacques-tati-pierre-richard",
			"category": "cinefr",
			"a": {
				"name": "Jacques Tati",
				"origin": "Mon oncle · 1958",
				"line": "Un imper, une pipe, et des gags au millimètre.",
				"giphyIds": [],
				"giphyQuery": "Jacques Tati",
				"gifUrls": ["https://media.tenor.com/bhIHQ0JagfkAAAAC/jacques-tati-playtime.gif"]
			},
			"b": {
				"name": "Pierre Richard",
				"origin": "Le Grand Blond · 1972",
				"line": "Une chaussure noire et beaucoup de maladresse.",
				"giphyIds": [],
				"giphyQuery": "Pierre Richard",
				"gifUrls": ["https://media.tenor.com/QiPT-KXDAfQAAAAC/ch%C3%A8vre-jules.gif"]
			}
		},
		{
			"id": "cinefr-christian-clavier-thierry-lhermitte",
			"category": "cinefr",
			"a": {
				"name": "Christian Clavier",
				"origin": "Le Splendid · 1974",
				"line": "Jacquouille, Napoléon, et beaucoup de cris.",
				"giphyIds": ["IHuS5o0hs2BVe"],
				"giphyQuery": "Christian Clavier"
			},
			"b": {
				"name": "Thierry Lhermitte",
				"origin": "Le Splendid · 1974",
				"line": "Le séducteur des Bronzés.",
				"giphyIds": [],
				"giphyQuery": "Thierry Lhermitte",
				"gifUrls": ["https://media.tenor.com/QnxZJZWkNdMAAAAC/belle-t%C3%AAte-de-vainqueur-le-d%C3%AEner-de-cons.gif"]
			}
		},
		{
			"id": "cinefr-les-choristes-le-petit-nicolas",
			"category": "cinefr",
			"a": {
				"name": "Les Choristes",
				"origin": "Christophe Barratier · 2004",
				"line": "Une chorale, un internat, et des frissons.",
				"giphyIds": ["j5KabUmARslBZHZdg6"],
				"giphyQuery": "Les Choristes"
			},
			"b": {
				"name": "Le Petit Nicolas",
				"origin": "Laurent Tirard · 2009",
				"line": "L’école, les copains, et des bêtises.",
				"giphyIds": [],
				"giphyQuery": "Le Petit Nicolas",
				"gifUrls": ["https://media.tenor.com/tNAVccHGM14AAAAC/agnan-agnan-le-petit-nicolas.gif"]
			}
		},
		{
			"id": "cinefr-le-pacte-des-loups-les-rivieres-pourpres",
			"category": "cinefr",
			"a": {
				"name": "Le Pacte des loups",
				"origin": "Christophe Gans · 2001",
				"line": "Une bête mystérieuse et du kung-fu en 1764.",
				"giphyIds": [],
				"giphyQuery": "Brotherhood of the Wolf",
				"gifUrls": ["https://media.tenor.com/2K3AuJ_EKWwAAAAC/brotherhood-of.gif"]
			},
			"b": {
				"name": "Les Rivières pourpres",
				"origin": "Mathieu Kassovitz · 2000",
				"line": "Deux flics, un glacier, et des frissons.",
				"giphyIds": [],
				"giphyQuery": "Crimson Rivers",
				"gifUrls": ["https://media.tenor.com/Zyks82ezHq0AAAAC/les-rivieres-pourpres-olivier-marchal.gif"]
			}
		},
		{
			"id": "cinefr-jean-paul-belmondo-alain-delon",
			"category": "cinefr",
			"a": {
				"name": "Jean-Paul Belmondo",
				"origin": "À bout de souffle · 1960",
				"line": "Des cascades sans doublure et un sourire en coin.",
				"giphyIds": ["YrEMVIxF1rSVXcUc2Y"],
				"giphyQuery": "Jean-Paul Belmondo"
			},
			"b": {
				"name": "Alain Delon",
				"origin": "Le Samouraï · 1967",
				"line": "Le regard bleu, et la classe.",
				"giphyIds": ["H1kCbNzRYJCx5teutr"],
				"giphyQuery": "Alain Delon"
			}
		},
		{
			"id": "cinefr-les-demoiselles-de-rochefort-les-parapluies-de-cherbourg",
			"category": "cinefr",
			"a": {
				"name": "Les Demoiselles de Rochefort",
				"origin": "Jacques Demy · 1967",
				"line": "Des jumelles, des chansons, et des marins.",
				"giphyIds": [],
				"giphyQuery": "Les Demoiselles de Rochefort"
			},
			"b": {
				"name": "Les Parapluies de Cherbourg",
				"origin": "Jacques Demy · 1964",
				"line": "Tout le film est chanté. Tout.",
				"giphyIds": [],
				"giphyQuery": "Umbrellas of Cherbourg"
			}
		},
		{
			"id": "cinefr-la-vache-et-le-prisonnier-don-camillo",
			"category": "cinefr",
			"a": {
				"name": "La Vache et le Prisonnier",
				"origin": "Henri Verneuil · 1959",
				"line": "Fernandel s’évade avec une vache.",
				"giphyIds": [],
				"giphyQuery": "La Vache et le Prisonnier Fernandel"
			},
			"b": {
				"name": "Don Camillo",
				"origin": "Julien Duvivier · 1952",
				"line": "Un curé qui parle au crucifix.",
				"giphyIds": [],
				"giphyQuery": "Don Camillo Fernandel"
			}
		},
		{
			"id": "cinefr-les-sous-doues-les-profs",
			"category": "cinefr",
			"a": {
				"name": "Les Sous-doués",
				"origin": "Claude Zidi · 1980",
				"line": "Le bac, et beaucoup de triche.",
				"giphyIds": [],
				"giphyQuery": "Les Sous-doues"
			},
			"b": {
				"name": "Les Profs",
				"origin": "Pierre-François Martin-Laval · 2013",
				"line": "Les pires profs de France pour les pires élèves.",
				"giphyIds": [],
				"giphyQuery": "Les Profs film"
			}
		},
		{
			"id": "cinefr-rrrrrr-didier",
			"category": "cinefr",
			"a": {
				"name": "RRRrrr !!!",
				"origin": "Alain Chabat · 2004",
				"line": "La préhistoire, et le secret du shampoing.",
				"giphyIds": [],
				"giphyQuery": "RRRrrr film"
			},
			"b": {
				"name": "Didier",
				"origin": "Alain Chabat · 1997",
				"line": "Un chien qui devient homme et joue au foot.",
				"giphyIds": [],
				"giphyQuery": "Didier Chabat"
			}
		},
		{
			"id": "cinefr-la-classe-americaine-les-trois-freres",
			"category": "cinefr",
			"a": {
				"name": "La Classe américaine",
				"origin": "Michel Hazanavicius · 1993",
				"line": "Des classiques d’Hollywood, entièrement redoublés.",
				"giphyIds": [],
				"giphyQuery": "La Classe americaine"
			},
			"b": {
				"name": "Les Trois Frères",
				"origin": "Les Inconnus · 1995",
				"line": "Trois frères, un héritage, et aucun argent à la fin.",
				"giphyIds": [],
				"giphyQuery": "Les Trois Freres"
			}
		},
		{
			"id": "cinefr-le-prenom-un-air-de-famille",
			"category": "cinefr",
			"a": {
				"name": "Le Prénom",
				"origin": "Alexandre de La Patellière · 2012",
				"line": "Un dîner, un prénom, et tout explose.",
				"giphyIds": [],
				"giphyQuery": "Le Prenom film"
			},
			"b": {
				"name": "Un air de famille",
				"origin": "Cédric Klapisch · 1996",
				"line": "Un vendredi soir au café, et des rancœurs.",
				"giphyIds": [],
				"giphyQuery": "Un air de famille"
			}
		},
		{
			"id": "cinefr-l-auberge-espagnole-les-petits-mouchoirs",
			"category": "cinefr",
			"a": {
				"name": "L’Auberge espagnole",
				"origin": "Cédric Klapisch · 2002",
				"line": "Erasmus à Barcelone, dans une colocation chaotique.",
				"giphyIds": [],
				"giphyQuery": "L'Auberge espagnole"
			},
			"b": {
				"name": "Les Petits Mouchoirs",
				"origin": "Guillaume Canet · 2010",
				"line": "Des vacances entre amis, et beaucoup de larmes.",
				"giphyIds": [],
				"giphyQuery": "Les Petits Mouchoirs"
			}
		},
		{
			"id": "cinefr-l-aile-ou-la-cuisse-le-grand-restaurant",
			"category": "cinefr",
			"a": {
				"name": "L’Aile ou la Cuisse",
				"origin": "Claude Zidi · 1976",
				"line": "Un critique gastronomique contre la malbouffe.",
				"giphyIds": [],
				"giphyQuery": "L'Aile ou la Cuisse"
			},
			"b": {
				"name": "Le Grand Restaurant",
				"origin": "Jacques Besnard · 1966",
				"line": "De Funès, maître d’hôtel tyrannique.",
				"giphyIds": [],
				"giphyQuery": "Le Grand Restaurant"
			}
		},
		{
			"id": "cinefr-le-splendid-les-robins-des-bois",
			"category": "cinefr",
			"a": {
				"name": "Le Splendid",
				"origin": "Troupe · 1974",
				"line": "Les Bronzés, le Père Noël, et un sens du malaise.",
				"giphyIds": [],
				"giphyQuery": "Le Splendid troupe"
			},
			"b": {
				"name": "Les Robins des Bois",
				"origin": "Canal+ · 1998",
				"line": "Des sketchs et des personnages absurdes.",
				"giphyIds": [],
				"giphyQuery": "Robins des Bois"
			}
		},
		{
			"id": "cinefr-les-inconnus-les-nuls",
			"category": "cinefr",
			"a": {
				"name": "Les Inconnus",
				"origin": "Trio · 1990",
				"line": "Des sketchs et des parodies cultes.",
				"giphyIds": [],
				"giphyQuery": "Les Inconnus"
			},
			"b": {
				"name": "Les Nuls",
				"origin": "Canal+ · 1987",
				"line": "Des fausses pubs et un sens de l’absurde.",
				"giphyIds": [],
				"giphyQuery": "Les Nuls"
			}
		},
		{
			"id": "cinefr-omar-et-fred-les-guignols",
			"category": "cinefr",
			"a": {
				"name": "Omar et Fred",
				"origin": "Le SAV · 2005",
				"line": "Le service après-vente des émissions.",
				"giphyIds": [],
				"giphyQuery": "Omar et Fred"
			},
			"b": {
				"name": "Les Guignols",
				"origin": "Canal+ · 1988",
				"line": "Des marionnettes qui se moquent de tout le monde.",
				"giphyIds": [],
				"giphyQuery": "Les Guignols de l'info"
			}
		},
		{
			"id": "cinefr-subway-nikita",
			"category": "cinefr",
			"a": {
				"name": "Subway",
				"origin": "Luc Besson · 1985",
				"line": "Des cheveux en pétard dans le métro.",
				"giphyIds": [],
				"giphyQuery": "Subway film 1985"
			},
			"b": {
				"name": "Nikita",
				"origin": "Luc Besson · 1990",
				"line": "Une tueuse au service de l’État.",
				"giphyIds": [],
				"giphyQuery": "Nikita film"
			}
		},
		{
			"id": "cinefr-a-bout-de-souffle-les-quatre-cents-coups",
			"category": "cinefr",
			"a": {
				"name": "À bout de souffle",
				"origin": "Jean-Luc Godard · 1960",
				"line": "« New York Herald Tribune ! »",
				"giphyIds": [],
				"giphyQuery": "A bout de souffle Godard"
			},
			"b": {
				"name": "Les Quatre Cents Coups",
				"origin": "François Truffaut · 1959",
				"line": "Un gamin, une fugue, et la mer.",
				"giphyIds": [],
				"giphyQuery": "400 Blows Truffaut"
			}
		},
		{
			"id": "cinefr-delicatessen-la-cite-des-enfants-perdus",
			"category": "cinefr",
			"a": {
				"name": "Delicatessen",
				"origin": "Jeunet et Caro · 1991",
				"line": "Un boucher, un immeuble, et un menu douteux.",
				"giphyIds": [],
				"giphyQuery": "Delicatessen film"
			},
			"b": {
				"name": "La Cité des enfants perdus",
				"origin": "Jeunet et Caro · 1995",
				"line": "Un savant qui vole les rêves des enfants.",
				"giphyIds": [],
				"giphyQuery": "City of Lost Children"
			}
		},
		{
			"id": "cinefr-les-randonneurs-les-seigneurs",
			"category": "cinefr",
			"a": {
				"name": "Les Randonneurs",
				"origin": "Philippe Harel · 1997",
				"line": "Une randonnée en Corse, et pas les plus sportifs.",
				"giphyIds": [],
				"giphyQuery": "Les Randonneurs"
			},
			"b": {
				"name": "Les Seigneurs",
				"origin": "Olivier Dahan · 2012",
				"line": "D’anciens footballeurs sur une île bretonne.",
				"giphyIds": [],
				"giphyQuery": "Les Seigneurs film"
			}
		},
		{
			"id": "cinefr-mais-ou-est-donc-passee-la-7e-co-papy-fait-de-la-resistance",
			"category": "cinefr",
			"a": {
				"name": "Mais où est donc passée la 7e compagnie ?",
				"origin": "Robert Lamoureux · 1973",
				"line": "Trois soldats perdus et un camion.",
				"giphyIds": [],
				"giphyQuery": "7eme compagnie"
			},
			"b": {
				"name": "Papy fait de la résistance",
				"origin": "Jean-Marie Poiré · 1983",
				"line": "Une famille de résistants, et Super Résistant.",
				"giphyIds": [],
				"giphyQuery": "Papy fait de la resistance"
			}
		},
		{
			"id": "cinefr-jacquouille-godefroy-de-montmirail",
			"category": "cinefr",
			"a": {
				"name": "Jacquouille",
				"origin": "Les Visiteurs · 1993",
				"line": "Des dents abîmées et un rire inoubliable.",
				"giphyIds": [],
				"giphyQuery": "Jacquouille"
			},
			"b": {
				"name": "Godefroy de Montmirail",
				"origin": "Les Visiteurs · 1993",
				"line": "Un comte très noble, très perdu en 1993.",
				"giphyIds": [],
				"giphyQuery": "Godefroy de Montmirail"
			}
		},
		{
			"id": "cinefr-la-boum-diabolo-menthe",
			"category": "cinefr",
			"a": {
				"name": "La Boum",
				"origin": "Claude Pinoteau · 1980",
				"line": "Un premier slow et un casque de walkman.",
				"giphyIds": [],
				"giphyQuery": "La Boum"
			},
			"b": {
				"name": "Diabolo menthe",
				"origin": "Diane Kurys · 1977",
				"line": "Le lycée, les copines, et les années 60.",
				"giphyIds": [],
				"giphyQuery": "Diabolo menthe film"
			}
		},
		{
			"id": "cinefr-le-dernier-metro-cyrano-de-bergerac",
			"category": "cinefr",
			"a": {
				"name": "Le Dernier Métro",
				"origin": "François Truffaut · 1980",
				"line": "Un théâtre sous l’Occupation.",
				"giphyIds": [],
				"giphyQuery": "Le Dernier Metro"
			},
			"b": {
				"name": "Cyrano de Bergerac",
				"origin": "Jean-Paul Rappeneau · 1990",
				"line": "Un nez immense et des tirades.",
				"giphyIds": [],
				"giphyQuery": "Cyrano de Bergerac"
			}
		},
		{
			"id": "cinefr-jean-gabin-lino-ventura",
			"category": "cinefr",
			"a": {
				"name": "Jean Gabin",
				"origin": "Le Quai des brumes · 1938",
				"line": "La gueule, la voix, et la casquette.",
				"giphyIds": [],
				"giphyQuery": "Jean Gabin"
			},
			"b": {
				"name": "Lino Ventura",
				"origin": "Les Tontons flingueurs · 1963",
				"line": "Un regard, et tout le monde se tait.",
				"giphyIds": [],
				"giphyQuery": "Lino Ventura"
			}
		},
		{
			"id": "cinefr-sophie-marceau-isabelle-adjani",
			"category": "cinefr",
			"a": {
				"name": "Sophie Marceau",
				"origin": "La Boum · 1980",
				"line": "Le premier slow de toute une génération.",
				"giphyIds": [],
				"giphyQuery": "Sophie Marceau"
			},
			"b": {
				"name": "Isabelle Adjani",
				"origin": "L’Histoire d’Adèle H. · 1975",
				"line": "Cinq César, un record.",
				"giphyIds": [],
				"giphyQuery": "Isabelle Adjani"
			}
		},
		{
			"id": "cinefr-fantomas-belphegor",
			"category": "cinefr",
			"a": {
				"name": "Fantômas",
				"origin": "André Hunebelle · 1964",
				"line": "Un masque bleu et un rire diabolique.",
				"giphyIds": [],
				"giphyQuery": "Fantomas"
			},
			"b": {
				"name": "Belphégor",
				"origin": "Série télé · 1965",
				"line": "Un fantôme au Louvre.",
				"giphyIds": [],
				"giphyQuery": "Belphegor Louvre"
			}
		},
		{
			"id": "cinefr-la-chevre-les-comperes",
			"category": "cinefr",
			"a": {
				"name": "La Chèvre",
				"origin": "Francis Veber · 1981",
				"line": "L’homme le plus malchanceux du monde. Et c’est utile.",
				"giphyIds": [],
				"giphyQuery": "La Chevre film"
			},
			"b": {
				"name": "Les Compères",
				"origin": "Francis Veber · 1983",
				"line": "Deux pères pour un seul fils. Enfin, en théorie.",
				"giphyIds": [],
				"giphyQuery": "Les Comperes"
			}
		},
		{
			"id": "cinefr-les-ripoux-les-specialistes",
			"category": "cinefr",
			"a": {
				"name": "Les Ripoux",
				"origin": "Claude Zidi · 1984",
				"line": "Deux flics, beaucoup d’arrangements.",
				"giphyIds": [],
				"giphyQuery": "Les Ripoux"
			},
			"b": {
				"name": "Les Spécialistes",
				"origin": "Patrice Leconte · 1985",
				"line": "Un casse impossible et une évasion.",
				"giphyIds": [],
				"giphyQuery": "Les Specialistes film"
			}
		},
		{
			"id": "cinefr-la-mome-the-artist",
			"category": "cinefr",
			"a": {
				"name": "La Môme",
				"origin": "Olivier Dahan · 2007",
				"line": "Piaf, et un Oscar pour Marion Cotillard.",
				"giphyIds": [],
				"giphyQuery": "La Mome Cotillard"
			},
			"b": {
				"name": "The Artist",
				"origin": "Michel Hazanavicius · 2011",
				"line": "Un film muet en noir et blanc, et cinq Oscars.",
				"giphyIds": [],
				"giphyQuery": "The Artist movie"
			}
		},
		{
			"id": "cinefr-l-arnac-ur-hors-de-prix",
			"category": "cinefr",
			"a": {
				"name": "L’Arnacœur",
				"origin": "Pascal Chaumeil · 2010",
				"line": "Son métier : briser des couples, avec style.",
				"giphyIds": [],
				"giphyQuery": "L'Arnacoeur"
			},
			"b": {
				"name": "Hors de prix",
				"origin": "Pierre Salvadori · 2006",
				"line": "Une croqueuse de diamants et un barman.",
				"giphyIds": [],
				"giphyQuery": "Hors de prix"
			}
		},
		{
			"id": "cinefr-babysitting-alibi-com",
			"category": "cinefr",
			"a": {
				"name": "Babysitting",
				"origin": "Philippe Lacheau · 2014",
				"line": "Une soirée de baby-sitting qui dérape. Beaucoup.",
				"giphyIds": [],
				"giphyQuery": "Babysitting film"
			},
			"b": {
				"name": "Alibi.com",
				"origin": "Philippe Lacheau · 2017",
				"line": "Une agence qui fabrique des alibis. Ça tourne mal.",
				"giphyIds": [],
				"giphyQuery": "Alibi.com film"
			}
		},
		{
			"id": "cinefr-le-grand-bain-le-sens-de-la-fete",
			"category": "cinefr",
			"a": {
				"name": "Le Grand Bain",
				"origin": "Gilles Lellouche · 2018",
				"line": "Des hommes en crise qui font de la natation synchronisée.",
				"giphyIds": [],
				"giphyQuery": "Le Grand Bain"
			},
			"b": {
				"name": "Le Sens de la fête",
				"origin": "Olivier Nakache et Éric Toledano · 2017",
				"line": "Un mariage dans un château, et tout ce qui peut rater rate.",
				"giphyIds": [],
				"giphyQuery": "Le Sens de la fete"
			}
		},
		{
			"id": "cinefr-les-trois-mousquetaires-le-bossu",
			"category": "cinefr",
			"a": {
				"name": "Les Trois Mousquetaires",
				"origin": "Alexandre Dumas · 1844",
				"line": "Un pour tous, tous pour un.",
				"giphyIds": [],
				"giphyQuery": "Three Musketeers"
			},
			"b": {
				"name": "Le Bossu",
				"origin": "Paul Féval · 1857",
				"line": "« Si tu ne viens pas à Lagardère, Lagardère ira à toi ! »",
				"giphyIds": [],
				"giphyQuery": "Le Bossu Lagardere"
			}
		},
		{
			"id": "cinefr-fanfan-la-tulipe-angelique-marquise-des-anges",
			"category": "cinefr",
			"a": {
				"name": "Fanfan la Tulipe",
				"origin": "Christian-Jaque · 1952",
				"line": "Un soldat, des duels, et des cascades.",
				"giphyIds": [],
				"giphyQuery": "Fanfan la Tulipe"
			},
			"b": {
				"name": "Angélique, marquise des anges",
				"origin": "Bernard Borderie · 1964",
				"line": "Des robes, des intrigues, et des suites.",
				"giphyIds": [],
				"giphyQuery": "Angelique marquise des anges"
			}
		},
		{
			"id": "cinefr-le-pari-mais-qui-a-tue-pamela-rose",
			"category": "cinefr",
			"a": {
				"name": "Le Pari",
				"origin": "Didier Bourdon et Bernard Campan · 1997",
				"line": "Deux beaux-frères qui parient d’arrêter de fumer.",
				"giphyIds": [],
				"giphyQuery": "Le Pari film"
			},
			"b": {
				"name": "Mais qui a tué Pamela Rose ?",
				"origin": "Éric Lartigau · 2003",
				"line": "Deux agents du FBI très, très approximatifs.",
				"giphyIds": [],
				"giphyQuery": "Pamela Rose Kad Olivier"
			}
		},
		{
			"id": "internet-gif-jif",
			"category": "internet",
			"question": "Ça se prononce comment : GIF ou JIF ?",
			"a": {
				"name": "GIF",
				"origin": "Comme dans « gare »",
				"line": "Le « G » de « graphique ». Logique.",
				"giphyIds": [],
				"giphyQuery": "GIF"
			},
			"b": {
				"name": "JIF",
				"origin": "Comme dans « girafe »",
				"line": "C’est ce que voulait son inventeur. Personne n’écoute.",
				"giphyIds": [],
				"giphyQuery": "jif peanut butter"
			}
		},
		{
			"id": "internet-rickroll-nyan-cat",
			"category": "internet",
			"a": {
				"name": "Rickroll",
				"origin": "Rick Astley · 1987",
				"line": "Tu ne l’as pas vu venir. Encore.",
				"giphyIds": [],
				"giphyQuery": "Rick Astley rickroll"
			},
			"b": {
				"name": "Nyan Cat",
				"origin": "YouTube · 2011",
				"line": "Un chat-gâteau qui laisse un arc-en-ciel derrière lui.",
				"giphyIds": [],
				"giphyQuery": "Nyan Cat"
			}
		},
		{
			"id": "internet-tiktok-youtube",
			"category": "internet",
			"a": {
				"name": "TikTok",
				"origin": "Chine · 2016",
				"line": "Trente secondes, puis trois heures.",
				"giphyIds": [],
				"giphyQuery": "TikTok dance"
			},
			"b": {
				"name": "YouTube",
				"origin": "Californie · 2005",
				"line": "« N’oubliez pas de liker et de vous abonner. »",
				"giphyIds": [],
				"giphyQuery": "YouTube subscribe"
			}
		},
		{
			"id": "internet-twitter-facebook",
			"category": "internet",
			"a": {
				"name": "Twitter",
				"origin": "Californie · 2006",
				"line": "Des débats en 280 caractères.",
				"giphyIds": [],
				"giphyQuery": "Twitter bird"
			},
			"b": {
				"name": "Facebook",
				"origin": "Harvard · 2004",
				"line": "Les anniversaires de gens que tu as perdus de vue.",
				"giphyIds": [],
				"giphyQuery": "Facebook like"
			}
		},
		{
			"id": "internet-instagram-snapchat",
			"category": "internet",
			"a": {
				"name": "Instagram",
				"origin": "Californie · 2010",
				"line": "Des filtres, des brunchs et des couchers de soleil.",
				"giphyIds": [],
				"giphyQuery": "Instagram filter"
			},
			"b": {
				"name": "Snapchat",
				"origin": "Californie · 2011",
				"line": "Des photos qui disparaissent. En théorie.",
				"giphyIds": [],
				"giphyQuery": "Snapchat ghost"
			}
		},
		{
			"id": "internet-doge-grumpy-cat",
			"category": "internet",
			"a": {
				"name": "Doge",
				"origin": "Japon · 2013",
				"line": "Much meme. Very wow.",
				"giphyIds": [],
				"giphyQuery": "Doge shiba"
			},
			"b": {
				"name": "Grumpy Cat",
				"origin": "Arizona · 2012",
				"line": "Ne sourit jamais. Gagne quand même.",
				"giphyIds": [],
				"giphyQuery": "Grumpy Cat"
			}
		},
		{
			"id": "internet-this-is-fine-le-petit-ami-distrait",
			"category": "internet",
			"a": {
				"name": "« This is fine »",
				"origin": "KC Green · 2013",
				"line": "Tout va bien. Tout brûle.",
				"giphyIds": [],
				"giphyQuery": "this is fine dog"
			},
			"b": {
				"name": "Le petit ami distrait",
				"origin": "Photo de stock · 2015",
				"line": "Regarde ailleurs, et Internet en a fait une saga.",
				"giphyIds": [],
				"giphyQuery": "distracted boyfriend meme"
			}
		},
		{
			"id": "internet-wikipedia-google",
			"category": "internet",
			"a": {
				"name": "Wikipédia",
				"origin": "Internet · 2001",
				"line": "Tu cherchais un détail, tu lis sur les manchots à trois heures du matin.",
				"giphyIds": [],
				"giphyQuery": "Wikipedia"
			},
			"b": {
				"name": "Google",
				"origin": "Californie · 1998",
				"line": "Toutes les réponses, et quelques pubs au passage.",
				"giphyIds": [],
				"giphyQuery": "Google search"
			}
		},
		{
			"id": "internet-les-captcha-mot-de-passe-oublie",
			"category": "internet",
			"a": {
				"name": "Les CAPTCHA",
				"origin": "Les formulaires",
				"line": "Coche les feux de signalisation. Encore.",
				"giphyIds": [],
				"giphyQuery": "captcha robot"
			},
			"b": {
				"name": "Mot de passe oublié",
				"origin": "L’écran de connexion",
				"line": "Le nouveau ne peut pas être l’ancien.",
				"giphyIds": [],
				"giphyQuery": "forgot password"
			}
		},
		{
			"id": "internet-ctrl-c-ctrl-v-ctrl-z",
			"category": "internet",
			"a": {
				"name": "Ctrl+C, Ctrl+V",
				"origin": "Ton clavier",
				"line": "La base de toute carrière.",
				"giphyIds": [],
				"giphyQuery": "copy paste"
			},
			"b": {
				"name": "Ctrl+Z",
				"origin": "Ton clavier",
				"line": "Le bouton qu’on voudrait dans la vraie vie.",
				"giphyIds": [],
				"giphyQuery": "undo"
			}
		},
		{
			"id": "internet-les-chats-d-internet-les-chiens-d-internet",
			"category": "internet",
			"a": {
				"name": "Les chats d’Internet",
				"origin": "YouTube",
				"line": "Font tomber des objets et règnent sur le Web.",
				"giphyIds": [],
				"giphyQuery": "cat knocking things off table"
			},
			"b": {
				"name": "Les chiens d’Internet",
				"origin": "YouTube",
				"line": "Font des têtes surprises et attendrissent tout le monde.",
				"giphyIds": [],
				"giphyQuery": "surprised dog"
			}
		},
		{
			"id": "internet-msn-messenger-skyblog",
			"category": "internet",
			"a": {
				"name": "MSN Messenger",
				"origin": "Microsoft · 1999",
				"line": "Le wizz, les pseudos à rallonge, et « apparaître hors ligne ».",
				"giphyIds": [],
				"giphyQuery": "MSN Messenger"
			},
			"b": {
				"name": "Skyblog",
				"origin": "Skyrock · 2002",
				"line": "Des paillettes, et « lâchez vos com’s ».",
				"giphyIds": [],
				"giphyQuery": "glitter text 2000s"
			}
		},
		{
			"id": "internet-netflix-disney",
			"category": "internet",
			"a": {
				"name": "Netflix",
				"origin": "Streaming · 2007",
				"line": "« Êtes-vous toujours en train de regarder ? »",
				"giphyIds": [],
				"giphyQuery": "Netflix"
			},
			"b": {
				"name": "Disney+",
				"origin": "Streaming · 2019",
				"line": "Des princesses, Star Wars et Marvel au même endroit.",
				"giphyIds": [],
				"giphyQuery": "Disney Plus"
			}
		},
		{
			"id": "internet-amazon-leboncoin",
			"category": "internet",
			"a": {
				"name": "Amazon",
				"origin": "Seattle · 1994",
				"line": "Livré demain, même ce dont tu n’avais pas besoin.",
				"giphyIds": [],
				"giphyQuery": "Amazon package delivery"
			},
			"b": {
				"name": "Leboncoin",
				"origin": "France · 2006",
				"line": "« Toujours disponible ? »",
				"giphyIds": [],
				"giphyQuery": "garage sale"
			}
		},
		{
			"id": "internet-discord-slack",
			"category": "internet",
			"a": {
				"name": "Discord",
				"origin": "Internet · 2015",
				"line": "Des serveurs pour tout, et même pour rien.",
				"giphyIds": [],
				"giphyQuery": "Discord"
			},
			"b": {
				"name": "Slack",
				"origin": "Internet · 2013",
				"line": "Le bureau, avec des notifications en plus.",
				"giphyIds": [],
				"giphyQuery": "Slack notification"
			}
		},
		{
			"id": "internet-twitch-la-tele",
			"category": "internet",
			"a": {
				"name": "Twitch",
				"origin": "Internet · 2011",
				"line": "Regarder des gens jouer. Et c’est génial.",
				"giphyIds": [],
				"giphyQuery": "Twitch streamer"
			},
			"b": {
				"name": "La télé",
				"origin": "Ton salon · années 1950",
				"line": "Un programme imposé, et le zapping libre.",
				"giphyIds": [],
				"giphyQuery": "vintage television"
			}
		},
		{
			"id": "internet-commentaires-youtube-avis-google",
			"category": "internet",
			"a": {
				"name": "Commentaires YouTube",
				"origin": "Sous la vidéo",
				"line": "« Qui écoute encore ça en 2025 ? »",
				"giphyIds": [],
				"giphyQuery": "youtube comments"
			},
			"b": {
				"name": "Avis Google",
				"origin": "Sur la carte",
				"line": "Une étoile, parce qu’il pleuvait.",
				"giphyIds": [],
				"giphyQuery": "one star review"
			}
		},
		{
			"id": "internet-chuck-norris-facts-jean-claude-van-damme",
			"category": "internet",
			"a": {
				"name": "Chuck Norris Facts",
				"origin": "Internet · 2005",
				"line": "Chuck Norris a compté jusqu’à l’infini. Deux fois.",
				"giphyIds": [],
				"giphyQuery": "Chuck Norris"
			},
			"b": {
				"name": "Jean-Claude Van Damme",
				"origin": "Interviews · années 2000",
				"line": "« Aware. »",
				"giphyIds": [],
				"giphyQuery": "Jean-Claude Van Damme"
			}
		},
		{
			"id": "internet-wi-fi-gratuit-batterie-a-100",
			"category": "internet",
			"a": {
				"name": "Wi-Fi gratuit",
				"origin": "Le café du coin",
				"line": "Le vrai luxe des temps modernes.",
				"giphyIds": [],
				"giphyQuery": "free wifi"
			},
			"b": {
				"name": "Batterie à 100 %",
				"origin": "Ton téléphone, le matin",
				"line": "Un état qui ne dure jamais.",
				"giphyIds": [],
				"giphyQuery": "phone battery full"
			}
		},
		{
			"id": "internet-la-banniere-cookies-la-pub-avant-la-video",
			"category": "internet",
			"a": {
				"name": "La bannière cookies",
				"origin": "Tous les sites",
				"line": "Accepter, refuser, ou paramétrer pendant dix minutes.",
				"giphyIds": [],
				"giphyQuery": "cookies"
			},
			"b": {
				"name": "La pub avant la vidéo",
				"origin": "YouTube",
				"line": "« Ignorer dans 5 secondes. »",
				"giphyIds": [],
				"giphyQuery": "skip ad"
			}
		},
		{
			"id": "internet-je-lis-tout-j-accepte-direct",
			"category": "internet",
			"question": "Les conditions d’utilisation : tu lis ou tu acceptes ?",
			"a": {
				"name": "Je lis tout",
				"origin": "Les conditions d’utilisation",
				"line": "Il y a forcément quelqu’un qui le fait.",
				"giphyIds": [],
				"giphyQuery": "reading terms and conditions"
			},
			"b": {
				"name": "J’accepte direct",
				"origin": "Les conditions d’utilisation",
				"line": "Tu as peut-être cédé ton âme. Pas grave.",
				"giphyIds": [],
				"giphyQuery": "I agree button"
			}
		},
		{
			"id": "internet-repondre-a-tous-copie-cachee",
			"category": "internet",
			"a": {
				"name": "Répondre à tous",
				"origin": "Ta boîte mail",
				"line": "La catastrophe en un clic.",
				"giphyIds": [],
				"giphyQuery": "reply all email"
			},
			"b": {
				"name": "Copie cachée",
				"origin": "Ta boîte mail",
				"line": "La discrétion. Ou le coup bas.",
				"giphyIds": [],
				"giphyQuery": "secret email"
			}
		},
		{
			"id": "internet-accuse-de-lecture-active-accuse-de-lecture-desactive",
			"category": "internet",
			"a": {
				"name": "Accusé de lecture activé",
				"origin": "Ta messagerie",
				"line": "Tu sais qu’il a lu. Il sait que tu sais.",
				"giphyIds": [],
				"giphyQuery": "seen message"
			},
			"b": {
				"name": "Accusé de lecture désactivé",
				"origin": "Ta messagerie",
				"line": "Le doute, pour l’éternité.",
				"giphyIds": [],
				"giphyQuery": "waiting for reply"
			}
		},
		{
			"id": "internet-notes-vocales-messages-ecrits",
			"category": "internet",
			"a": {
				"name": "Notes vocales",
				"origin": "Ta messagerie",
				"line": "Cinq minutes d’audio pour dire « oui ».",
				"giphyIds": [],
				"giphyQuery": "voice message"
			},
			"b": {
				"name": "Messages écrits",
				"origin": "Ta messagerie",
				"line": "Lus en trois secondes, réponse en trois jours.",
				"giphyIds": [],
				"giphyQuery": "texting"
			}
		},
		{
			"id": "internet-lol-mdr",
			"category": "internet",
			"a": {
				"name": "LOL",
				"origin": "L’anglais",
				"line": "International et sobre.",
				"giphyIds": [],
				"giphyQuery": "lol laughing"
			},
			"b": {
				"name": "MDR",
				"origin": "Le français",
				"line": "Mort de rire. Vraiment ?",
				"giphyIds": [],
				"giphyQuery": "laughing hard"
			}
		},
		{
			"id": "internet-les-chaines-de-mails-les-images-bon-mercredi",
			"category": "internet",
			"a": {
				"name": "Les chaînes de mails",
				"origin": "Années 2000",
				"line": "Envoie-la à dix personnes, sinon malheur.",
				"giphyIds": [],
				"giphyQuery": "chain email"
			},
			"b": {
				"name": "Les images « Bon mercredi »",
				"origin": "Le groupe WhatsApp de la famille",
				"line": "Des fleurs, des paillettes, et beaucoup d’amour.",
				"giphyIds": [],
				"giphyQuery": "good morning flowers"
			}
		},
		{
			"id": "internet-keep-calm-winter-is-coming",
			"category": "internet",
			"a": {
				"name": "« Keep calm »",
				"origin": "Internet · 2009",
				"line": "Garder son calme, sur tous les mugs du monde.",
				"giphyIds": [],
				"giphyQuery": "keep calm"
			},
			"b": {
				"name": "« Winter is coming »",
				"origin": "Game of Thrones · 2011",
				"line": "Pour annoncer n’importe quoi.",
				"giphyIds": [],
				"giphyQuery": "winter is coming"
			}
		},
		{
			"id": "internet-ice-bucket-challenge-harlem-shake",
			"category": "internet",
			"a": {
				"name": "Ice Bucket Challenge",
				"origin": "Internet · 2014",
				"line": "Un seau d’eau glacée, pour la bonne cause.",
				"giphyIds": [],
				"giphyQuery": "ice bucket challenge"
			},
			"b": {
				"name": "Harlem Shake",
				"origin": "Internet · 2013",
				"line": "Trente secondes, un casque, puis le chaos.",
				"giphyIds": [],
				"giphyQuery": "Harlem Shake"
			}
		},
		{
			"id": "internet-gangnam-style-despacito",
			"category": "internet",
			"a": {
				"name": "Gangnam Style",
				"origin": "Psy · 2012",
				"line": "La première vidéo à un milliard de vues.",
				"giphyIds": [],
				"giphyQuery": "Gangnam Style"
			},
			"b": {
				"name": "Despacito",
				"origin": "Luis Fonsi · 2017",
				"line": "Le record suivant, en plus lent.",
				"giphyIds": [],
				"giphyQuery": "Despacito"
			}
		},
		{
			"id": "internet-keyboard-cat-dramatic-chipmunk",
			"category": "internet",
			"a": {
				"name": "Keyboard Cat",
				"origin": "Internet · 2007",
				"line": "Un chat en t-shirt qui joue du clavier.",
				"giphyIds": [],
				"giphyQuery": "Keyboard Cat"
			},
			"b": {
				"name": "Dramatic Chipmunk",
				"origin": "Internet · 2007",
				"line": "Ce n’est même pas un écureuil. C’est un chien de prairie.",
				"giphyIds": [],
				"giphyQuery": "dramatic chipmunk"
			}
		},
		{
			"id": "internet-trollface-forever-alone",
			"category": "internet",
			"a": {
				"name": "Trollface",
				"origin": "Internet · 2008",
				"line": "Un sourire, une provocation.",
				"giphyIds": [],
				"giphyQuery": "trollface"
			},
			"b": {
				"name": "Forever Alone",
				"origin": "Internet · 2010",
				"line": "Un visage, et toute la solitude du monde.",
				"giphyIds": [],
				"giphyQuery": "forever alone"
			}
		},
		{
			"id": "internet-erreur-404-l-ecran-bleu",
			"category": "internet",
			"a": {
				"name": "Erreur 404",
				"origin": "Le Web",
				"line": "La page a perdu son débat.",
				"giphyIds": [],
				"giphyQuery": "404 error"
			},
			"b": {
				"name": "L’écran bleu",
				"origin": "Windows",
				"line": "Un problème a été rencontré. Encore.",
				"giphyIds": [],
				"giphyQuery": "blue screen of death"
			}
		},
		{
			"id": "internet-le-wi-fi-du-voisin-le-partage-de-connexion",
			"category": "internet",
			"a": {
				"name": "Le Wi-Fi du voisin",
				"origin": "L’immeuble",
				"line": "Le mot de passe, c’est « 12345678 ».",
				"giphyIds": [],
				"giphyQuery": "wifi signal"
			},
			"b": {
				"name": "Le partage de connexion",
				"origin": "Ton téléphone",
				"line": "Ton forfait pleure en silence.",
				"giphyIds": [],
				"giphyQuery": "phone hotspot"
			}
		},
		{
			"id": "internet-le-prince-heritier-par-mail-le-colis-en-attente",
			"category": "internet",
			"a": {
				"name": "Le prince héritier par mail",
				"origin": "Années 2000",
				"line": "Un héritage de dix millions, contre tes coordonnées bancaires.",
				"giphyIds": [],
				"giphyQuery": "scam email"
			},
			"b": {
				"name": "Le colis en attente",
				"origin": "Ton SMS",
				"line": "Votre colis attend. Il attend toujours.",
				"giphyIds": [],
				"giphyQuery": "package delivery waiting"
			}
		},
		{
			"id": "internet-among-us-fall-guys",
			"category": "internet",
			"a": {
				"name": "Among Us",
				"origin": "InnerSloth · 2018",
				"line": "« Imposteur ! »",
				"giphyIds": [],
				"giphyQuery": "Among Us"
			},
			"b": {
				"name": "Fall Guys",
				"origin": "Mediatonic · 2020",
				"line": "Des bonbons sur pattes qui tombent.",
				"giphyIds": [],
				"giphyQuery": "Fall Guys"
			}
		},
		{
			"id": "internet-encore-une-video-dodo",
			"category": "internet",
			"question": "Il est minuit : tu scrolles ou tu dors ?",
			"a": {
				"name": "Encore une vidéo",
				"origin": "Ton lit, minuit",
				"line": "Il est deux heures. Tu ne sais pas comment.",
				"giphyIds": [],
				"giphyQuery": "scrolling phone bed"
			},
			"b": {
				"name": "Dodo",
				"origin": "Ton lit, minuit",
				"line": "Le téléphone posé loin, et la sagesse.",
				"giphyIds": [],
				"giphyQuery": "sleeping"
			}
		},
		{
			"id": "internet-clubhouse-bereal",
			"category": "internet",
			"a": {
				"name": "Clubhouse",
				"origin": "Internet · 2020",
				"line": "Le réseau social vocal qui a fait pschitt.",
				"giphyIds": [],
				"giphyQuery": "podcast microphone"
			},
			"b": {
				"name": "BeReal",
				"origin": "Internet · 2020",
				"line": "Deux minutes pour poster, toujours au mauvais moment.",
				"giphyIds": [],
				"giphyQuery": "selfie camera"
			}
		},
		{
			"id": "internet-wordle-2048",
			"category": "internet",
			"a": {
				"name": "Wordle",
				"origin": "Internet · 2021",
				"line": "Cinq lettres, six essais, une obsession.",
				"giphyIds": [],
				"giphyQuery": "Wordle"
			},
			"b": {
				"name": "2048",
				"origin": "Internet · 2014",
				"line": "Des tuiles qui fusionnent, jusqu’à 2048.",
				"giphyIds": [],
				"giphyQuery": "2048 game"
			}
		},
		{
			"id": "internet-pokemon-go-geocaching",
			"category": "internet",
			"a": {
				"name": "Pokémon GO",
				"origin": "Niantic · 2016",
				"line": "Tout le monde dans les parcs, téléphone à la main.",
				"giphyIds": [],
				"giphyQuery": "Pokemon Go"
			},
			"b": {
				"name": "Geocaching",
				"origin": "Internet · 2000",
				"line": "Une chasse au trésor, avec un GPS.",
				"giphyIds": [],
				"giphyQuery": "treasure hunt"
			}
		},
		{
			"id": "internet-woman-yelling-at-a-cat-le-meme-drake",
			"category": "internet",
			"a": {
				"name": "« Woman yelling at a cat »",
				"origin": "Internet · 2019",
				"line": "Une femme qui crie, un chat qui s’en fiche.",
				"giphyIds": [],
				"giphyQuery": "woman yelling at cat"
			},
			"b": {
				"name": "Le mème Drake",
				"origin": "Internet · 2015",
				"line": "Non à ça. Oui à ça.",
				"giphyIds": [],
				"giphyQuery": "Drake hotline bling"
			}
		},
		{
			"id": "internet-asmr-les-videos-satisfaisantes",
			"category": "internet",
			"a": {
				"name": "ASMR",
				"origin": "Internet · 2010",
				"line": "Des chuchotements qui donnent des frissons.",
				"giphyIds": [],
				"giphyQuery": "ASMR"
			},
			"b": {
				"name": "Les vidéos satisfaisantes",
				"origin": "Internet",
				"line": "Du sable coloré coupé en tranches.",
				"giphyIds": [],
				"giphyQuery": "oddly satisfying"
			}
		},
		{
			"id": "internet-unboxing-videos-de-reaction",
			"category": "internet",
			"a": {
				"name": "Unboxing",
				"origin": "YouTube",
				"line": "Ouvrir un carton, devant des millions de gens.",
				"giphyIds": [],
				"giphyQuery": "unboxing"
			},
			"b": {
				"name": "Vidéos de réaction",
				"origin": "YouTube",
				"line": "Regarder quelqu’un regarder une vidéo.",
				"giphyIds": [],
				"giphyQuery": "reaction face"
			}
		},
		{
			"id": "internet-navigation-privee-historique-complet",
			"category": "internet",
			"a": {
				"name": "Navigation privée",
				"origin": "Ton navigateur",
				"line": "Personne ne saura. À part ton fournisseur d’accès.",
				"giphyIds": [],
				"giphyQuery": "incognito"
			},
			"b": {
				"name": "Historique complet",
				"origin": "Ton navigateur",
				"line": "Toutes tes recherches de trois heures du matin, archivées.",
				"giphyIds": [],
				"giphyQuery": "browser history"
			}
		},
		{
			"id": "internet-le-modem-56k-la-fibre",
			"category": "internet",
			"a": {
				"name": "Le modem 56k",
				"origin": "Années 1990",
				"line": "Des bruits stridents et une image qui charge ligne par ligne.",
				"giphyIds": [],
				"giphyQuery": "dial up modem"
			},
			"b": {
				"name": "La fibre",
				"origin": "Années 2010",
				"line": "Tout télécharger en dix secondes, sauf la patience.",
				"giphyIds": [],
				"giphyQuery": "fast internet"
			}
		},
		{
			"id": "internet-les-forums-reddit",
			"category": "internet",
			"a": {
				"name": "Les forums",
				"origin": "Années 2000",
				"line": "« Up ! », et des débats sans fin.",
				"giphyIds": [],
				"giphyQuery": "old forum"
			},
			"b": {
				"name": "Reddit",
				"origin": "Internet · 2005",
				"line": "Une communauté pour tout. Vraiment tout.",
				"giphyIds": [],
				"giphyQuery": "Reddit"
			}
		},
		{
			"id": "internet-les-emoticones-les-emojis",
			"category": "internet",
			"a": {
				"name": "Les émoticônes",
				"origin": "Ton clavier",
				"line": "Deux points, un tiret, une parenthèse. L’élégance.",
				"giphyIds": [],
				"giphyQuery": "smiley face text"
			},
			"b": {
				"name": "Les emojis",
				"origin": "Ton téléphone",
				"line": "Un dessin pour chaque émotion, et trop de cœurs.",
				"giphyIds": [],
				"giphyQuery": "emoji"
			}
		},
		{
			"id": "internet-le-wi-fi-du-tgv-la-4g-dans-un-tunnel",
			"category": "internet",
			"a": {
				"name": "Le Wi-Fi du TGV",
				"origin": "Le train",
				"line": "Connecté. Puis plus. Puis connecté.",
				"giphyIds": [],
				"giphyQuery": "train wifi"
			},
			"b": {
				"name": "La 4G dans un tunnel",
				"origin": "Le tunnel",
				"line": "Un concept.",
				"giphyIds": [],
				"giphyQuery": "no signal"
			}
		},
		{
			"id": "internet-la-capture-d-ecran-le-lien",
			"category": "internet",
			"a": {
				"name": "La capture d’écran",
				"origin": "Ton téléphone",
				"line": "La preuve éternelle de ce que tu as dit.",
				"giphyIds": [],
				"giphyQuery": "screenshot"
			},
			"b": {
				"name": "Le lien",
				"origin": "Ton navigateur",
				"line": "Page introuvable, deux ans plus tard.",
				"giphyIds": [],
				"giphyQuery": "broken link"
			}
		},
		{
			"id": "internet-bug-fonctionnalite",
			"category": "internet",
			"question": "Ce comportement bizarre : bug ou fonctionnalité ?",
			"a": {
				"name": "Bug",
				"origin": "Le code",
				"line": "Un comportement inattendu.",
				"giphyIds": [],
				"giphyQuery": "computer bug"
			},
			"b": {
				"name": "Fonctionnalité",
				"origin": "Le code",
				"line": "Un bug, avec une bonne attitude.",
				"giphyIds": [],
				"giphyQuery": "feature not a bug"
			}
		},
		{
			"id": "internet-selfie-photo-de-paysage",
			"category": "internet",
			"a": {
				"name": "Selfie",
				"origin": "Bras tendu",
				"line": "Le bon angle, au quinzième essai.",
				"giphyIds": [],
				"giphyQuery": "selfie"
			},
			"b": {
				"name": "Photo de paysage",
				"origin": "Le belvédère",
				"line": "Ça rendait mieux en vrai.",
				"giphyIds": [],
				"giphyQuery": "landscape photo"
			}
		},
		{
			"id": "mots-serpilliere-wassingue",
			"category": "mots",
			"a": {
				"name": "Serpillière",
				"origin": "La France entière",
				"line": "Le nom du dictionnaire.",
				"giphyIds": [],
				"giphyQuery": "mop floor"
			},
			"b": {
				"name": "Wassingue",
				"origin": "Le Nord et la Belgique",
				"line": "Le même objet, avec l’accent.",
				"giphyIds": [],
				"giphyQuery": "mopping floor"
			}
		},
		{
			"id": "mots-sac-poche",
			"category": "mots",
			"a": {
				"name": "Sac",
				"origin": "La caisse du supermarché",
				"line": "Neutre, efficace, universel.",
				"giphyIds": [],
				"giphyQuery": "plastic bag"
			},
			"b": {
				"name": "Poche",
				"origin": "Le Sud-Ouest",
				"line": "« Vous voulez une poche ? » À Bordeaux, oui.",
				"giphyIds": [],
				"giphyQuery": "grocery bag"
			}
		},
		{
			"id": "mots-crayon-a-papier-crayon-de-bois",
			"category": "mots",
			"a": {
				"name": "Crayon à papier",
				"origin": "Le nord de la France",
				"line": "Il écrit sur du papier. Logique.",
				"giphyIds": [],
				"giphyQuery": "pencil"
			},
			"b": {
				"name": "Crayon de bois",
				"origin": "Le sud de la France",
				"line": "Il est en bois. Logique aussi.",
				"giphyIds": [],
				"giphyQuery": "wooden pencil"
			}
		},
		{
			"id": "mots-soixante-dix-septante",
			"category": "mots",
			"a": {
				"name": "Soixante-dix",
				"origin": "La France",
				"line": "Soixante plus dix. On aime le calcul mental.",
				"giphyIds": [],
				"giphyQuery": "number 70"
			},
			"b": {
				"name": "Septante",
				"origin": "La Belgique et la Suisse",
				"line": "Un seul mot, aucune addition.",
				"giphyIds": [],
				"giphyQuery": "Belgium flag"
			}
		},
		{
			"id": "mots-quatre-vingt-dix-nonante",
			"category": "mots",
			"a": {
				"name": "Quatre-vingt-dix",
				"origin": "La France",
				"line": "Quatre fois vingt, plus dix. Simple.",
				"giphyIds": [],
				"giphyQuery": "math confused"
			},
			"b": {
				"name": "Nonante",
				"origin": "La Belgique et la Suisse",
				"line": "Sept-, huit-, nonante. Logique, enfin.",
				"giphyIds": [],
				"giphyQuery": "math genius"
			}
		},
		{
			"id": "mots-quatre-vingts-huitante",
			"category": "mots",
			"a": {
				"name": "Quatre-vingts",
				"origin": "La France et la Belgique",
				"line": "Le nombre qui demande une multiplication.",
				"giphyIds": [],
				"giphyQuery": "calculator"
			},
			"b": {
				"name": "Huitante",
				"origin": "La Suisse romande",
				"line": "Le canton de Vaud a tout compris.",
				"giphyIds": [],
				"giphyQuery": "Switzerland"
			}
		},
		{
			"id": "mots-tres-gave",
			"category": "mots",
			"a": {
				"name": "Très",
				"origin": "Le dictionnaire",
				"line": "Sobre et efficace.",
				"giphyIds": [],
				"giphyQuery": "very good"
			},
			"b": {
				"name": "Gavé",
				"origin": "Toulouse et Bordeaux",
				"line": "« C’est gavé bien. » Et c’est très bien.",
				"giphyIds": [],
				"giphyQuery": "super excited"
			}
		},
		{
			"id": "mots-personne-degun",
			"category": "mots",
			"a": {
				"name": "Personne",
				"origin": "Partout",
				"line": "Il n’y a personne.",
				"giphyIds": [],
				"giphyQuery": "empty room"
			},
			"b": {
				"name": "Dégun",
				"origin": "Marseille",
				"line": "Il n’y a dégun, et c’est plus chantant.",
				"giphyIds": [],
				"giphyQuery": "Marseille"
			}
		},
		{
			"id": "mots-le-pauvre-peuchere",
			"category": "mots",
			"a": {
				"name": "Le pauvre",
				"origin": "Partout",
				"line": "Compatissant, mais sans soleil.",
				"giphyIds": [],
				"giphyQuery": "sad face"
			},
			"b": {
				"name": "Peuchère",
				"origin": "La Provence",
				"line": "La compassion, avec l’accent du Midi.",
				"giphyIds": [],
				"giphyQuery": "Provence lavender"
			}
		},
		{
			"id": "mots-gant-de-toilette-debarbouillette",
			"category": "mots",
			"a": {
				"name": "Gant de toilette",
				"origin": "La France",
				"line": "Une moufle pour se laver.",
				"giphyIds": [],
				"giphyQuery": "washcloth"
			},
			"b": {
				"name": "Débarbouillette",
				"origin": "Le Québec",
				"line": "Un carré de tissu, et un mot superbe.",
				"giphyIds": [],
				"giphyQuery": "Quebec"
			}
		},
		{
			"id": "mots-voiture-char",
			"category": "mots",
			"a": {
				"name": "Voiture",
				"origin": "La France",
				"line": "Quatre roues, un volant.",
				"giphyIds": [],
				"giphyQuery": "car driving"
			},
			"b": {
				"name": "Char",
				"origin": "Le Québec",
				"line": "Quatre roues, et un petit air de Ben-Hur.",
				"giphyIds": [],
				"giphyQuery": "chariot race"
			}
		},
		{
			"id": "mots-e-mail-courriel",
			"category": "mots",
			"a": {
				"name": "E-mail",
				"origin": "La France, souvent",
				"line": "Court, international, un peu anglais.",
				"giphyIds": [],
				"giphyQuery": "email"
			},
			"b": {
				"name": "Courriel",
				"origin": "Le Québec",
				"line": "Inventé là-bas, adopté par la France.",
				"giphyIds": [],
				"giphyQuery": "mail letter"
			}
		},
		{
			"id": "mots-week-end-fin-de-semaine",
			"category": "mots",
			"a": {
				"name": "Week-end",
				"origin": "La France",
				"line": "Deux jours, en anglais.",
				"giphyIds": [],
				"giphyQuery": "weekend"
			},
			"b": {
				"name": "Fin de semaine",
				"origin": "Le Québec",
				"line": "Les deux mêmes jours, en français.",
				"giphyIds": [],
				"giphyQuery": "saturday relax"
			}
		},
		{
			"id": "mots-faire-du-shopping-magasiner",
			"category": "mots",
			"a": {
				"name": "Faire du shopping",
				"origin": "La France",
				"line": "Des magasins et une carte bancaire qui chauffe.",
				"giphyIds": [],
				"giphyQuery": "shopping bags"
			},
			"b": {
				"name": "Magasiner",
				"origin": "Le Québec",
				"line": "Le même programme, en un seul verbe.",
				"giphyIds": [],
				"giphyQuery": "shopping mall"
			}
		},
		{
			"id": "mots-dejeuner-diner",
			"category": "mots",
			"question": "Le repas de midi, tu l’appelles comment ?",
			"a": {
				"name": "Déjeuner",
				"origin": "La France",
				"line": "Midi, c’est le déjeuner. Point.",
				"giphyIds": [],
				"giphyQuery": "lunch"
			},
			"b": {
				"name": "Dîner",
				"origin": "La Belgique, la Suisse, le Québec",
				"line": "Midi, c’est le dîner. Et le soir, le souper.",
				"giphyIds": [],
				"giphyQuery": "lunchtime"
			}
		},
		{
			"id": "mots-diner-souper",
			"category": "mots",
			"question": "Et le repas du soir ?",
			"a": {
				"name": "Dîner",
				"origin": "La France",
				"line": "Le soir, on dîne.",
				"giphyIds": [],
				"giphyQuery": "dinner table"
			},
			"b": {
				"name": "Souper",
				"origin": "La Belgique, la Suisse, le Québec",
				"line": "Le soir, on soupe. Même sans soupe.",
				"giphyIds": [],
				"giphyQuery": "soup"
			}
		},
		{
			"id": "mots-petit-pain-pistolet",
			"category": "mots",
			"a": {
				"name": "Petit pain",
				"origin": "La France",
				"line": "Un petit pain, tout simplement.",
				"giphyIds": [],
				"giphyQuery": "bread roll"
			},
			"b": {
				"name": "Pistolet",
				"origin": "La Belgique",
				"line": "Un petit pain rond, qui ne tire pas.",
				"giphyIds": [],
				"giphyQuery": "bakery bread"
			}
		},
		{
			"id": "mots-averse-drache",
			"category": "mots",
			"a": {
				"name": "Averse",
				"origin": "Partout",
				"line": "Il pleut fort, puis ça s’arrête.",
				"giphyIds": [],
				"giphyQuery": "rain shower"
			},
			"b": {
				"name": "Drache",
				"origin": "La Belgique",
				"line": "Il pleut très fort. Comme souvent.",
				"giphyIds": [],
				"giphyQuery": "heavy rain"
			}
		},
		{
			"id": "mots-cet-apres-midi-tantot",
			"category": "mots",
			"a": {
				"name": "Cet après-midi",
				"origin": "La France",
				"line": "Plus tard dans la journée.",
				"giphyIds": [],
				"giphyQuery": "afternoon"
			},
			"b": {
				"name": "Tantôt",
				"origin": "La Belgique",
				"line": "Tout à l’heure, ou cet après-midi. Ça dépend.",
				"giphyIds": [],
				"giphyQuery": "waiting clock"
			}
		},
		{
			"id": "mots-poignee-de-porte-clenche",
			"category": "mots",
			"a": {
				"name": "Poignée de porte",
				"origin": "Partout",
				"line": "On l’abaisse, la porte s’ouvre.",
				"giphyIds": [],
				"giphyQuery": "door handle"
			},
			"b": {
				"name": "Clenche",
				"origin": "Le Nord et la Belgique",
				"line": "Même geste, plus de caractère.",
				"giphyIds": [],
				"giphyQuery": "opening door"
			}
		},
		{
			"id": "mots-mouchoir-kleenex",
			"category": "mots",
			"a": {
				"name": "Mouchoir",
				"origin": "Le dictionnaire",
				"line": "Le nom commun.",
				"giphyIds": [],
				"giphyQuery": "tissue"
			},
			"b": {
				"name": "Kleenex",
				"origin": "La marque",
				"line": "Une marque devenue un mot.",
				"giphyIds": [],
				"giphyQuery": "sneeze"
			}
		},
		{
			"id": "mots-refrigerateur-frigidaire",
			"category": "mots",
			"a": {
				"name": "Réfrigérateur",
				"origin": "Le dictionnaire",
				"line": "Cinq syllabes pour garder le beurre au frais.",
				"giphyIds": [],
				"giphyQuery": "fridge"
			},
			"b": {
				"name": "Frigidaire",
				"origin": "La langue courante",
				"line": "Une vieille marque américaine, devenue un nom commun.",
				"giphyIds": [],
				"giphyQuery": "open fridge"
			}
		},
		{
			"id": "mots-pain-aux-raisins-escargot",
			"category": "mots",
			"a": {
				"name": "Pain aux raisins",
				"origin": "La plupart des boulangeries",
				"line": "Des raisins, de la crème, une spirale.",
				"giphyIds": [],
				"giphyQuery": "pastry"
			},
			"b": {
				"name": "Escargot",
				"origin": "Certaines boulangeries",
				"line": "La même spirale, avec un nom plus drôle.",
				"giphyIds": [],
				"giphyQuery": "snail"
			}
		},
		{
			"id": "mots-essuie-tout-sopalin",
			"category": "mots",
			"a": {
				"name": "Essuie-tout",
				"origin": "Le dictionnaire",
				"line": "Il essuie tout. C’est écrit dessus.",
				"giphyIds": [],
				"giphyQuery": "paper towel"
			},
			"b": {
				"name": "Sopalin",
				"origin": "La marque",
				"line": "Une marque, devenue la norme.",
				"giphyIds": [],
				"giphyQuery": "spill cleaning"
			}
		},
		{
			"id": "mots-ruban-adhesif-scotch",
			"category": "mots",
			"a": {
				"name": "Ruban adhésif",
				"origin": "Le dictionnaire",
				"line": "Le nom officiel, que personne n’utilise.",
				"giphyIds": [],
				"giphyQuery": "tape"
			},
			"b": {
				"name": "Scotch",
				"origin": "La langue courante",
				"line": "Une marque, devenue un réflexe.",
				"giphyIds": [],
				"giphyQuery": "duct tape"
			}
		},
		{
			"id": "mots-correcteur-tipp-ex",
			"category": "mots",
			"a": {
				"name": "Correcteur",
				"origin": "Le dictionnaire",
				"line": "Pour corriger proprement.",
				"giphyIds": [],
				"giphyQuery": "correction pen"
			},
			"b": {
				"name": "Tipp-Ex",
				"origin": "La marque",
				"line": "Le blanc, l’odeur, et les dessins sur la trousse.",
				"giphyIds": [],
				"giphyQuery": "white out"
			}
		},
		{
			"id": "mots-fermeture-eclair-tirette",
			"category": "mots",
			"a": {
				"name": "Fermeture Éclair",
				"origin": "La France",
				"line": "Le nom d’une marque, lui aussi.",
				"giphyIds": [],
				"giphyQuery": "zipper"
			},
			"b": {
				"name": "Tirette",
				"origin": "La Belgique",
				"line": "On tire, ça se ferme. Imparable.",
				"giphyIds": [],
				"giphyQuery": "zip up"
			}
		},
		{
			"id": "mots-trousse-plumier",
			"category": "mots",
			"a": {
				"name": "Trousse",
				"origin": "La France",
				"line": "Des stylos, une gomme, et des copeaux de taille-crayon.",
				"giphyIds": [],
				"giphyQuery": "pencil case"
			},
			"b": {
				"name": "Plumier",
				"origin": "La Belgique",
				"line": "La même chose, avec un nom d’autrefois.",
				"giphyIds": [],
				"giphyQuery": "school supplies"
			}
		},
		{
			"id": "mots-chewing-gum-chique",
			"category": "mots",
			"a": {
				"name": "Chewing-gum",
				"origin": "La France",
				"line": "Le mot anglais, mâché à la française.",
				"giphyIds": [],
				"giphyQuery": "chewing gum"
			},
			"b": {
				"name": "Chique",
				"origin": "La Belgique",
				"line": "Un mot plus court, pour mâcher plus vite.",
				"giphyIds": [],
				"giphyQuery": "bubble gum"
			}
		},
		{
			"id": "mots-coller-peguer",
			"category": "mots",
			"a": {
				"name": "Coller",
				"origin": "Le dictionnaire",
				"line": "Ça colle.",
				"giphyIds": [],
				"giphyQuery": "glue"
			},
			"b": {
				"name": "Péguer",
				"origin": "Le Sud",
				"line": "Ça pègue. Et c’est plus collant.",
				"giphyIds": [],
				"giphyQuery": "sticky"
			}
		},
		{
			"id": "mots-avoir-hate-se-languir",
			"category": "mots",
			"a": {
				"name": "Avoir hâte",
				"origin": "Partout",
				"line": "J’ai hâte de te voir.",
				"giphyIds": [],
				"giphyQuery": "excited waiting"
			},
			"b": {
				"name": "Se languir",
				"origin": "Le Sud",
				"line": "Je me languis de te voir. C’est plus tendre.",
				"giphyIds": [],
				"giphyQuery": "longing"
			}
		},
		{
			"id": "mots-abimer-escagasser",
			"category": "mots",
			"a": {
				"name": "Abîmer",
				"origin": "Partout",
				"line": "C’est abîmé.",
				"giphyIds": [],
				"giphyQuery": "broken"
			},
			"b": {
				"name": "Escagasser",
				"origin": "Marseille",
				"line": "C’est escagassé. Beaucoup plus grave.",
				"giphyIds": [],
				"giphyQuery": "totally destroyed"
			}
		},
		{
			"id": "mots-fou-fada",
			"category": "mots",
			"a": {
				"name": "Fou",
				"origin": "Partout",
				"line": "Le mot de base.",
				"giphyIds": [],
				"giphyQuery": "crazy"
			},
			"b": {
				"name": "Fada",
				"origin": "La Provence",
				"line": "Fou, mais avec le soleil.",
				"giphyIds": [],
				"giphyQuery": "crazy dance"
			}
		},
		{
			"id": "mots-gone-minot",
			"category": "mots",
			"a": {
				"name": "Gone",
				"origin": "Lyon",
				"line": "Le gamin lyonnais, depuis Guignol.",
				"giphyIds": [],
				"giphyQuery": "Lyon"
			},
			"b": {
				"name": "Minot",
				"origin": "Marseille",
				"line": "Le gamin marseillais, ensoleillé.",
				"giphyIds": [],
				"giphyQuery": "kids playing"
			}
		},
		{
			"id": "mots-deux-bises-quatre-bises",
			"category": "mots",
			"question": "Pour dire bonjour : deux bises ou quatre ?",
			"a": {
				"name": "Deux bises",
				"origin": "Paris, et bien d’autres",
				"line": "Une à droite, une à gauche. On gagne du temps.",
				"giphyIds": [],
				"giphyQuery": "cheek kiss"
			},
			"b": {
				"name": "Quatre bises",
				"origin": "Quelques régions de France",
				"line": "On s’applique, et on y passe la soirée.",
				"giphyIds": [],
				"giphyQuery": "kiss kiss"
			}
		},
		{
			"id": "mots-la-bise-le-check",
			"category": "mots",
			"a": {
				"name": "La bise",
				"origin": "La France",
				"line": "Joue contre joue, et le doute sur le nombre.",
				"giphyIds": [],
				"giphyQuery": "french kiss cheek"
			},
			"b": {
				"name": "Le check",
				"origin": "Les potes",
				"line": "Poing contre poing, zéro microbe.",
				"giphyIds": [],
				"giphyQuery": "fist bump"
			}
		},
		{
			"id": "mots-tutoyer-vouvoyer",
			"category": "mots",
			"question": "Avec un inconnu : tu ou vous ?",
			"a": {
				"name": "Tutoyer",
				"origin": "Les start-up",
				"line": "« Salut, tu vas bien ? » Direct.",
				"giphyIds": [],
				"giphyQuery": "hello friend"
			},
			"b": {
				"name": "Vouvoyer",
				"origin": "Le reste du monde",
				"line": "La politesse, et une distance de sécurité.",
				"giphyIds": [],
				"giphyQuery": "polite bow"
			}
		},
		{
			"id": "mots-pain-perdu-pain-dore",
			"category": "mots",
			"a": {
				"name": "Pain perdu",
				"origin": "La France",
				"line": "Du pain rassis sauvé avec des œufs.",
				"giphyIds": [],
				"giphyQuery": "french toast"
			},
			"b": {
				"name": "Pain doré",
				"origin": "Le Québec",
				"line": "Le même, mais il brille.",
				"giphyIds": [],
				"giphyQuery": "golden toast"
			}
		},
		{
			"id": "mots-il-fait-froid-ca-caille",
			"category": "mots",
			"a": {
				"name": "Il fait froid",
				"origin": "Partout",
				"line": "La météo, simplement.",
				"giphyIds": [],
				"giphyQuery": "cold weather"
			},
			"b": {
				"name": "Ça caille",
				"origin": "L’argot",
				"line": "La même météo, avec plus d’émotion.",
				"giphyIds": [],
				"giphyQuery": "freezing cold"
			}
		},
		{
			"id": "mots-la-thune-le-fric",
			"category": "mots",
			"a": {
				"name": "La thune",
				"origin": "L’argot",
				"line": "« J’ai plus de thune. »",
				"giphyIds": [],
				"giphyQuery": "money"
			},
			"b": {
				"name": "Le fric",
				"origin": "L’argot aussi",
				"line": "« Il a plein de fric. »",
				"giphyIds": [],
				"giphyQuery": "money rain"
			}
		},
		{
			"id": "mots-louche-chelou",
			"category": "mots",
			"a": {
				"name": "Louche",
				"origin": "Le dictionnaire",
				"line": "Suspect, bizarre.",
				"giphyIds": [],
				"giphyQuery": "suspicious"
			},
			"b": {
				"name": "Chelou",
				"origin": "Le verlan",
				"line": "Louche, à l’envers. Encore plus suspect.",
				"giphyIds": [],
				"giphyQuery": "suspicious look"
			}
		},
		{
			"id": "mots-lourd-relou",
			"category": "mots",
			"a": {
				"name": "Lourd",
				"origin": "Le dictionnaire",
				"line": "Pénible, insistant.",
				"giphyIds": [],
				"giphyQuery": "annoying"
			},
			"b": {
				"name": "Relou",
				"origin": "Le verlan",
				"line": "Lourd, à l’envers. Encore plus pénible.",
				"giphyIds": [],
				"giphyQuery": "eye roll"
			}
		},
		{
			"id": "mots-salut-wesh",
			"category": "mots",
			"a": {
				"name": "Salut",
				"origin": "Partout",
				"line": "Le bonjour décontracté.",
				"giphyIds": [],
				"giphyQuery": "hi wave"
			},
			"b": {
				"name": "Wesh",
				"origin": "La cour de récré",
				"line": "Le salut des grands frères.",
				"giphyIds": [],
				"giphyQuery": "whats up"
			}
		},
		{
			"id": "mots-bisous-bises",
			"category": "mots",
			"question": "Pour finir un message : bisous ou bises ?",
			"a": {
				"name": "Bisous",
				"origin": "Les amis",
				"line": "Tendre et affectueux.",
				"giphyIds": [],
				"giphyQuery": "blowing kiss"
			},
			"b": {
				"name": "Bises",
				"origin": "Tout le monde",
				"line": "Affectueux, mais à bonne distance.",
				"giphyIds": [],
				"giphyQuery": "air kiss"
			}
		},
		{
			"id": "mots-cordialement-bien-a-vous",
			"category": "mots",
			"a": {
				"name": "Cordialement",
				"origin": "Les e-mails pro",
				"line": "Poli, et un peu froid.",
				"giphyIds": [],
				"giphyQuery": "office email"
			},
			"b": {
				"name": "Bien à vous",
				"origin": "Les e-mails pro aussi",
				"line": "Poli, et un peu plus chaleureux.",
				"giphyIds": [],
				"giphyQuery": "polite smile"
			}
		},
		{
			"id": "mots-du-coup-donc",
			"category": "mots",
			"a": {
				"name": "Du coup",
				"origin": "Toutes les conversations",
				"line": "Le mot qui ne veut rien dire et qui est partout.",
				"giphyIds": [],
				"giphyQuery": "so anyway"
			},
			"b": {
				"name": "Donc",
				"origin": "La grammaire",
				"line": "Lui, il veut dire quelque chose.",
				"giphyIds": [],
				"giphyQuery": "thinking"
			}
		},
		{
			"id": "mots-slt-cv-salut-ca-va",
			"category": "mots",
			"a": {
				"name": "« Slt cv »",
				"origin": "Les textos de 2005",
				"line": "L’économie de caractères.",
				"giphyIds": [],
				"giphyQuery": "old phone texting"
			},
			"b": {
				"name": "« Salut, ça va ? »",
				"origin": "Les textos d’aujourd’hui",
				"line": "Des mots entiers. Quel luxe.",
				"giphyIds": [],
				"giphyQuery": "texting smile"
			}
		},
		{
			"id": "mots-vin-vinte",
			"category": "mots",
			"question": "« Vingt », ça se prononce comment ?",
			"a": {
				"name": "« Vin »",
				"origin": "La plupart des Français",
				"line": "Le t reste muet.",
				"giphyIds": [],
				"giphyQuery": "wine"
			},
			"b": {
				"name": "« Vinte »",
				"origin": "L’Est et la Belgique",
				"line": "On prononce le t, et on assume.",
				"giphyIds": [],
				"giphyQuery": "number twenty"
			}
		},
		{
			"id": "mots-moins-moinsse",
			"category": "mots",
			"question": "« Moins », tu le prononces comment ?",
			"a": {
				"name": "« Moins »",
				"origin": "Le Nord",
				"line": "Sans le s.",
				"giphyIds": [],
				"giphyQuery": "minus"
			},
			"b": {
				"name": "« Moinsse »",
				"origin": "Le Sud",
				"line": "Avec le s, et le soleil.",
				"giphyIds": [],
				"giphyQuery": "sunny south"
			}
		},
		{
			"id": "mots-une-pinte-un-demi",
			"category": "mots",
			"question": "Au bar : une pinte ou un demi ?",
			"a": {
				"name": "Une pinte",
				"origin": "Les grandes soifs",
				"line": "Un demi-litre, ou presque.",
				"giphyIds": [],
				"giphyQuery": "pint of beer"
			},
			"b": {
				"name": "Un demi",
				"origin": "La terrasse",
				"line": "Vingt-cinq centilitres, et la conscience tranquille.",
				"giphyIds": [],
				"giphyQuery": "beer terrace"
			}
		},
		{
			"id": "nostalgie-walkman-discman",
			"category": "nostalgie",
			"a": {
				"name": "Walkman",
				"origin": "Sony · 1979",
				"line": "Une cassette, et un crayon pour la rembobiner.",
				"giphyIds": [],
				"giphyQuery": "Walkman cassette"
			},
			"b": {
				"name": "Discman",
				"origin": "Sony · 1984",
				"line": "Un CD, qui saute au moindre pas.",
				"giphyIds": [],
				"giphyQuery": "Discman"
			}
		},
		{
			"id": "nostalgie-club-dorothee-les-minikeums",
			"category": "nostalgie",
			"a": {
				"name": "Club Dorothée",
				"origin": "TF1 · 1987",
				"line": "Des dessins animés à la chaîne, et Les Musclés.",
				"giphyIds": [],
				"giphyQuery": "Club Dorothee"
			},
			"b": {
				"name": "Les Minikeums",
				"origin": "France 3 · 1993",
				"line": "Des marionnettes qui présentent les dessins animés.",
				"giphyIds": [],
				"giphyQuery": "puppets show"
			}
		},
		{
			"id": "nostalgie-spice-girls-backstreet-boys",
			"category": "nostalgie",
			"a": {
				"name": "Spice Girls",
				"origin": "Londres · 1994",
				"line": "Cinq Spice et du girl power.",
				"giphyIds": [],
				"giphyQuery": "Spice Girls"
			},
			"b": {
				"name": "Backstreet Boys",
				"origin": "Orlando · 1993",
				"line": "Cinq garçons et des chorégraphies synchronisées.",
				"giphyIds": [],
				"giphyQuery": "Backstreet Boys"
			}
		},
		{
			"id": "nostalgie-tamagotchi-furby",
			"category": "nostalgie",
			"a": {
				"name": "Tamagotchi",
				"origin": "Bandai · 1996",
				"line": "Mort de faim pendant le cours de maths.",
				"giphyIds": [],
				"giphyQuery": "Tamagotchi"
			},
			"b": {
				"name": "Furby",
				"origin": "Tiger · 1998",
				"line": "Parle la nuit, sans raison, sans bouton off.",
				"giphyIds": [],
				"giphyQuery": "Furby"
			}
		},
		{
			"id": "nostalgie-pogs-billes",
			"category": "nostalgie",
			"a": {
				"name": "Pogs",
				"origin": "Années 90",
				"line": "Des capsules en carton, et un kini pour tout gagner.",
				"giphyIds": [],
				"giphyQuery": "pogs"
			},
			"b": {
				"name": "Billes",
				"origin": "La cour de récré",
				"line": "Des agates, des calots, et des procès.",
				"giphyIds": [],
				"giphyQuery": "marbles"
			}
		},
		{
			"id": "nostalgie-polly-pocket-micro-machines",
			"category": "nostalgie",
			"a": {
				"name": "Polly Pocket",
				"origin": "Bluebird · 1989",
				"line": "Un monde entier dans une boîte à poudre.",
				"giphyIds": [],
				"giphyQuery": "Polly Pocket"
			},
			"b": {
				"name": "Micro Machines",
				"origin": "Galoob · 1987",
				"line": "Des voitures minuscules, et une pub qui parlait très vite.",
				"giphyIds": [],
				"giphyQuery": "Micro Machines"
			}
		},
		{
			"id": "nostalgie-les-muscles-helene-et-les-garcons",
			"category": "nostalgie",
			"a": {
				"name": "Les Musclés",
				"origin": "Club Dorothée · 1989",
				"line": "Les musiciens les plus énergiques du petit écran.",
				"giphyIds": [],
				"giphyQuery": "90s band"
			},
			"b": {
				"name": "Hélène et les Garçons",
				"origin": "TF1 · 1992",
				"line": "La cafétéria de la fac, et des histoires d’amour.",
				"giphyIds": [],
				"giphyQuery": "90s sitcom"
			}
		},
		{
			"id": "nostalgie-le-prince-de-bel-air-sauves-par-le-gong",
			"category": "nostalgie",
			"a": {
				"name": "Le Prince de Bel-Air",
				"origin": "NBC · 1990",
				"line": "Un ado de Philadelphie chez son oncle très riche.",
				"giphyIds": [],
				"giphyQuery": "Fresh Prince of Bel Air"
			},
			"b": {
				"name": "Sauvés par le gong",
				"origin": "NBC · 1989",
				"line": "Le lycée, Zack Morris, et un téléphone énorme.",
				"giphyIds": [],
				"giphyQuery": "Saved by the Bell"
			}
		},
		{
			"id": "nostalgie-alerte-a-malibu-buffy-contre-les-vampires",
			"category": "nostalgie",
			"a": {
				"name": "Alerte à Malibu",
				"origin": "NBC · 1989",
				"line": "Des sauveteurs qui courent au ralenti.",
				"giphyIds": [],
				"giphyQuery": "Baywatch"
			},
			"b": {
				"name": "Buffy contre les vampires",
				"origin": "The WB · 1997",
				"line": "Des cours le jour, des vampires la nuit.",
				"giphyIds": [],
				"giphyQuery": "Buffy the Vampire Slayer"
			}
		},
		{
			"id": "nostalgie-minitel-fax",
			"category": "nostalgie",
			"a": {
				"name": "Minitel",
				"origin": "France Télécom · 1982",
				"line": "3615, et la facture qui suit.",
				"giphyIds": [],
				"giphyQuery": "Minitel"
			},
			"b": {
				"name": "Fax",
				"origin": "Le bureau",
				"line": "Une feuille qui sort en couinant.",
				"giphyIds": [],
				"giphyQuery": "fax machine"
			}
		},
		{
			"id": "nostalgie-nokia-3310-tatoo",
			"category": "nostalgie",
			"a": {
				"name": "Nokia 3310",
				"origin": "Nokia · 2000",
				"line": "Indestructible, et Snake dedans.",
				"giphyIds": [],
				"giphyQuery": "Nokia 3310"
			},
			"b": {
				"name": "Tatoo",
				"origin": "France Télécom · 1995",
				"line": "Des messages en chiffres, à décoder.",
				"giphyIds": [],
				"giphyQuery": "pager beeper"
			}
		},
		{
			"id": "nostalgie-vhs-dvd",
			"category": "nostalgie",
			"a": {
				"name": "VHS",
				"origin": "Années 80-90",
				"line": "Rembobiner avant de rendre.",
				"giphyIds": [],
				"giphyQuery": "VHS tape"
			},
			"b": {
				"name": "DVD",
				"origin": "1996",
				"line": "Des bonus, et des menus interminables.",
				"giphyIds": [],
				"giphyQuery": "DVD"
			}
		},
		{
			"id": "nostalgie-videoclub-canal-crypte",
			"category": "nostalgie",
			"a": {
				"name": "Vidéoclub",
				"origin": "Le quartier",
				"line": "Une heure à choisir la cassette du samedi soir.",
				"giphyIds": [],
				"giphyQuery": "video store"
			},
			"b": {
				"name": "Canal+ crypté",
				"origin": "Canal+ · 1984",
				"line": "Plisser les yeux devant une image brouillée.",
				"giphyIds": [],
				"giphyQuery": "static tv"
			}
		},
		{
			"id": "nostalgie-power-rangers-bioman",
			"category": "nostalgie",
			"a": {
				"name": "Power Rangers",
				"origin": "Fox · 1993",
				"line": "Cinq ados, des combinaisons, et un robot géant.",
				"giphyIds": [],
				"giphyQuery": "Power Rangers"
			},
			"b": {
				"name": "Bioman",
				"origin": "Japon · 1984",
				"line": "L’original japonais, encore plus coloré.",
				"giphyIds": [],
				"giphyQuery": "Bioman sentai"
			}
		},
		{
			"id": "nostalgie-chaussures-a-lumieres-buffalo",
			"category": "nostalgie",
			"a": {
				"name": "Chaussures à lumières",
				"origin": "Années 90",
				"line": "Elles clignotent à chaque pas.",
				"giphyIds": [],
				"giphyQuery": "light up shoes"
			},
			"b": {
				"name": "Buffalo",
				"origin": "Années 90",
				"line": "Des semelles de dix centimètres.",
				"giphyIds": [],
				"giphyQuery": "platform shoes"
			}
		},
		{
			"id": "nostalgie-baggy-jean-taille-basse",
			"category": "nostalgie",
			"a": {
				"name": "Baggy",
				"origin": "Années 90",
				"line": "Un pantalon taille 48 sur un ado taille 36.",
				"giphyIds": [],
				"giphyQuery": "baggy jeans"
			},
			"b": {
				"name": "Jean taille basse",
				"origin": "Années 2000",
				"line": "Très, très bas.",
				"giphyIds": [],
				"giphyQuery": "low rise jeans"
			}
		},
		{
			"id": "nostalgie-tazos-cartes-pokemon",
			"category": "nostalgie",
			"a": {
				"name": "Tazos",
				"origin": "Années 90",
				"line": "Des disques en plastique, dans les paquets de chips.",
				"giphyIds": [],
				"giphyQuery": "Tazos",
				"giphyKeywords": ["pog"]
			},
			"b": {
				"name": "Cartes Pokémon",
				"origin": "Japon · 1996",
				"line": "Le Dracaufeu holographique, le Graal.",
				"giphyIds": [],
				"giphyQuery": "Charizard card"
			}
		},
		{
			"id": "nostalgie-rubik-s-cube-simon",
			"category": "nostalgie",
			"a": {
				"name": "Rubik’s Cube",
				"origin": "Ernő Rubik · 1974",
				"line": "Mélangé en trois secondes, résolu jamais.",
				"giphyIds": [],
				"giphyQuery": "Rubik's Cube"
			},
			"b": {
				"name": "Simon",
				"origin": "Milton Bradley · 1978",
				"line": "Des couleurs, des bips, et une mémoire mise à l’épreuve.",
				"giphyIds": [],
				"giphyQuery": "Simon game"
			}
		},
		{
			"id": "nostalgie-super-nintendo-mega-drive",
			"category": "nostalgie",
			"a": {
				"name": "Super Nintendo",
				"origin": "Nintendo · 1990",
				"line": "Mario, Zelda, et des cartouches qu’on soufflait.",
				"giphyIds": [],
				"giphyQuery": "Super Nintendo"
			},
			"b": {
				"name": "Mega Drive",
				"origin": "Sega · 1988",
				"line": "Sonic, et des pubs qui provoquaient Nintendo.",
				"giphyIds": [],
				"giphyQuery": "Sega Genesis"
			}
		},
		{
			"id": "nostalgie-nintendo-64-playstation",
			"category": "nostalgie",
			"a": {
				"name": "Nintendo 64",
				"origin": "Nintendo · 1996",
				"line": "Une manette à trois poignées.",
				"giphyIds": [],
				"giphyQuery": "Nintendo 64"
			},
			"b": {
				"name": "PlayStation",
				"origin": "Sony · 1994",
				"line": "Des CD, et des cartes mémoire pleines.",
				"giphyIds": [],
				"giphyQuery": "PlayStation 1"
			}
		},
		{
			"id": "nostalgie-titanic-jurassic-park",
			"category": "nostalgie",
			"a": {
				"name": "Titanic",
				"origin": "James Cameron · 1997",
				"line": "Un bateau, un iceberg, et une porte assez grande pour deux.",
				"giphyIds": [],
				"giphyQuery": "Titanic movie"
			},
			"b": {
				"name": "Jurassic Park",
				"origin": "Steven Spielberg · 1993",
				"line": "Des dinosaures, et un verre d’eau qui tremble.",
				"giphyIds": [],
				"giphyQuery": "Jurassic Park"
			}
		},
		{
			"id": "nostalgie-men-in-black-independence-day",
			"category": "nostalgie",
			"a": {
				"name": "Men in Black",
				"origin": "Barry Sonnenfeld · 1997",
				"line": "Deux costumes noirs et un neuralyseur.",
				"giphyIds": [],
				"giphyQuery": "Men in Black"
			},
			"b": {
				"name": "Independence Day",
				"origin": "Roland Emmerich · 1996",
				"line": "Des aliens, et un grand discours du président.",
				"giphyIds": [],
				"giphyQuery": "Independence Day"
			}
		},
		{
			"id": "nostalgie-sabrina-l-apprentie-sorciere-charmed",
			"category": "nostalgie",
			"a": {
				"name": "Sabrina, l’apprentie sorcière",
				"origin": "ABC · 1996",
				"line": "Une ado sorcière, et un chat qui parle.",
				"giphyIds": [],
				"giphyQuery": "Sabrina Salem"
			},
			"b": {
				"name": "Charmed",
				"origin": "The WB · 1998",
				"line": "Trois sœurs sorcières à San Francisco.",
				"giphyIds": [],
				"giphyQuery": "Charmed"
			}
		},
		{
			"id": "nostalgie-2be3-l5",
			"category": "nostalgie",
			"a": {
				"name": "2Be3",
				"origin": "France · 1996",
				"line": "Trois garçons, des abdos, et « Partir un jour ».",
				"giphyIds": [],
				"giphyQuery": "90s boy band"
			},
			"b": {
				"name": "L5",
				"origin": "Popstars · 2001",
				"line": "Cinq filles nées d’un télé-crochet.",
				"giphyIds": [],
				"giphyQuery": "girl band"
			}
		},
		{
			"id": "nostalgie-fort-boyard-intervilles",
			"category": "nostalgie",
			"a": {
				"name": "Fort Boyard",
				"origin": "France 2 · 1990",
				"line": "Des clés, des énigmes, et le père Fouras.",
				"giphyIds": [],
				"giphyQuery": "Fort Boyard"
			},
			"b": {
				"name": "Intervilles",
				"origin": "Depuis 1962",
				"line": "Des vachettes, de la mousse, et des fous rires.",
				"giphyIds": [],
				"giphyQuery": "Intervilles"
			}
		},
		{
			"id": "nostalgie-le-bigdil-le-juste-prix",
			"category": "nostalgie",
			"a": {
				"name": "Le Bigdil",
				"origin": "TF1 · 1998",
				"line": "Lagaf’, des cadeaux, et beaucoup de bruit.",
				"giphyIds": [],
				"giphyQuery": "game show"
			},
			"b": {
				"name": "Le Juste Prix",
				"origin": "TF1 · 1988",
				"line": "« Le juste prix ! »",
				"giphyIds": [],
				"giphyQuery": "The Price is Right"
			}
		},
		{
			"id": "nostalgie-cassette-audio-cd",
			"category": "nostalgie",
			"a": {
				"name": "Cassette audio",
				"origin": "Années 80-90",
				"line": "On enregistrait la radio en coupant l’animateur.",
				"giphyIds": [],
				"giphyQuery": "cassette tape"
			},
			"b": {
				"name": "CD",
				"origin": "Années 90",
				"line": "Brillant, et rayé dès le premier jour.",
				"giphyIds": [],
				"giphyQuery": "compact disc"
			}
		},
		{
			"id": "nostalgie-pin-s-scoubidous",
			"category": "nostalgie",
			"a": {
				"name": "Pin’s",
				"origin": "Années 90",
				"line": "Une veste couverte de badges.",
				"giphyIds": [],
				"giphyQuery": "pins collection"
			},
			"b": {
				"name": "Scoubidous",
				"origin": "Années 90",
				"line": "Des fils en plastique et des porte-clés.",
				"giphyIds": [],
				"giphyQuery": "scoubidou"
			}
		},
		{
			"id": "nostalgie-doc-martens-converse",
			"category": "nostalgie",
			"a": {
				"name": "Doc Martens",
				"origin": "Années 90",
				"line": "Des bottes indestructibles.",
				"giphyIds": [],
				"giphyQuery": "Doc Martens"
			},
			"b": {
				"name": "Converse",
				"origin": "Années 90",
				"line": "Des baskets en toile, toujours délacées.",
				"giphyIds": [],
				"giphyQuery": "Converse"
			}
		},
		{
			"id": "nostalgie-bi-bop-telephone-a-cadran",
			"category": "nostalgie",
			"a": {
				"name": "Bi-Bop",
				"origin": "France Télécom · 1993",
				"line": "Le téléphone qui ne marchait que près d’une borne.",
				"giphyIds": [],
				"giphyQuery": "old mobile phone"
			},
			"b": {
				"name": "Téléphone à cadran",
				"origin": "Le salon",
				"line": "Composer un numéro prenait une minute.",
				"giphyIds": [],
				"giphyQuery": "rotary phone"
			}
		},
		{
			"id": "nostalgie-ally-mcbeal-urgences",
			"category": "nostalgie",
			"a": {
				"name": "Ally McBeal",
				"origin": "Fox · 1997",
				"line": "Un cabinet d’avocats et un bébé qui danse.",
				"giphyIds": [],
				"giphyQuery": "Ally McBeal dancing baby"
			},
			"b": {
				"name": "Urgences",
				"origin": "NBC · 1994",
				"line": "Les urgences de Chicago, et George Clooney en blouse.",
				"giphyIds": [],
				"giphyQuery": "ER tv show"
			}
		},
		{
			"id": "nostalgie-twin-peaks-le-cameleon",
			"category": "nostalgie",
			"a": {
				"name": "Twin Peaks",
				"origin": "David Lynch · 1990",
				"line": "« Qui a tué Laura Palmer ? »",
				"giphyIds": [],
				"giphyQuery": "Twin Peaks"
			},
			"b": {
				"name": "Le Caméléon",
				"origin": "NBC · 1996",
				"line": "Il peut devenir n’importe qui.",
				"giphyIds": [],
				"giphyQuery": "The Pretender"
			}
		},
		{
			"id": "nostalgie-beverly-hills-90210-dawson",
			"category": "nostalgie",
			"a": {
				"name": "Beverly Hills 90210",
				"origin": "Fox · 1990",
				"line": "Des ados de Beverly Hills, et des rouflaquettes.",
				"giphyIds": [],
				"giphyQuery": "Beverly Hills 90210"
			},
			"b": {
				"name": "Dawson",
				"origin": "The WB · 1998",
				"line": "Des ados qui parlent comme des philosophes.",
				"giphyIds": [],
				"giphyQuery": "Dawson's Creek"
			}
		},
		{
			"id": "nostalgie-hit-machine-top-50",
			"category": "nostalgie",
			"a": {
				"name": "Hit Machine",
				"origin": "M6 · 1994",
				"line": "Charly, Lulu, et le classement des ventes.",
				"giphyIds": [],
				"giphyQuery": "90s pop dance"
			},
			"b": {
				"name": "Top 50",
				"origin": "Canal+ · 1984",
				"line": "Le classement de la semaine, chanson par chanson.",
				"giphyIds": [],
				"giphyQuery": "music charts"
			}
		},
		{
			"id": "nostalgie-video-gag-surprise-sur-prise",
			"category": "nostalgie",
			"a": {
				"name": "Vidéo Gag",
				"origin": "TF1 · 1990",
				"line": "Des chutes, et des rires enregistrés.",
				"giphyIds": [],
				"giphyQuery": "funny fail"
			},
			"b": {
				"name": "Surprise sur prise",
				"origin": "France · 1987",
				"line": "Des caméras cachées, et Marcel Béliveau.",
				"giphyIds": [],
				"giphyQuery": "hidden camera"
			}
		},
		{
			"id": "nostalgie-macarena-lambada",
			"category": "nostalgie",
			"a": {
				"name": "Macarena",
				"origin": "Los del Río · 1993",
				"line": "Une chorégraphie que tout le monde connaît.",
				"giphyIds": [],
				"giphyQuery": "Macarena"
			},
			"b": {
				"name": "Lambada",
				"origin": "Kaoma · 1989",
				"line": "Une danse très, très rapprochée.",
				"giphyIds": [],
				"giphyQuery": "Lambada"
			}
		},
		{
			"id": "nostalgie-aqua-eiffel-65",
			"category": "nostalgie",
			"a": {
				"name": "Aqua",
				"origin": "Danemark · 1997",
				"line": "Une poupée en plastique et un tube mondial.",
				"giphyIds": [],
				"giphyQuery": "Aqua Barbie Girl"
			},
			"b": {
				"name": "Eiffel 65",
				"origin": "Italie · 1998",
				"line": "Tout est bleu. Tout.",
				"giphyIds": [],
				"giphyQuery": "Eiffel 65 Blue"
			}
		},
		{
			"id": "nostalgie-les-colos-les-vacances-chez-mamie",
			"category": "nostalgie",
			"a": {
				"name": "Les colos",
				"origin": "L’été",
				"line": "Des chansons dans le car, et des lettres aux parents.",
				"giphyIds": [],
				"giphyQuery": "summer camp"
			},
			"b": {
				"name": "Les vacances chez mamie",
				"origin": "L’été",
				"line": "Des confitures, et la télé à 20 heures.",
				"giphyIds": [],
				"giphyQuery": "grandma"
			}
		},
		{
			"id": "nostalgie-chocapic-miel-pops",
			"category": "nostalgie",
			"a": {
				"name": "Chocapic",
				"origin": "Nestlé · 1984",
				"line": "Le chocolat dès le petit-déjeuner.",
				"giphyIds": [],
				"giphyQuery": "cereal chocolate"
			},
			"b": {
				"name": "Miel Pops",
				"origin": "Kellogg’s",
				"line": "Le miel, et une abeille qui chante.",
				"giphyIds": [],
				"giphyQuery": "honey cereal"
			}
		},
		{
			"id": "nostalgie-kinder-surprise-malabar",
			"category": "nostalgie",
			"a": {
				"name": "Kinder Surprise",
				"origin": "Ferrero · 1974",
				"line": "Du chocolat, un jouet, et un dilemme.",
				"giphyIds": [],
				"giphyQuery": "Kinder Surprise"
			},
			"b": {
				"name": "Malabar",
				"origin": "France · 1958",
				"line": "Un chewing-gum rose, et un tatouage.",
				"giphyIds": [],
				"giphyQuery": "bubble gum"
			}
		},
		{
			"id": "nostalgie-rollers-skate",
			"category": "nostalgie",
			"a": {
				"name": "Rollers",
				"origin": "Années 90",
				"line": "Des genouillères, et des chutes en ville.",
				"giphyIds": [],
				"giphyQuery": "rollerblading"
			},
			"b": {
				"name": "Skate",
				"origin": "La rampe",
				"line": "Un ollie raté, et on recommence.",
				"giphyIds": [],
				"giphyQuery": "skateboard"
			}
		},
		{
			"id": "nostalgie-lego-playmobil",
			"category": "nostalgie",
			"a": {
				"name": "Lego",
				"origin": "Danemark · 1958",
				"line": "Une brique, et une douleur sous le pied.",
				"giphyIds": [],
				"giphyQuery": "Lego"
			},
			"b": {
				"name": "Playmobil",
				"origin": "Allemagne · 1974",
				"line": "Des petits bonshommes au sourire éternel.",
				"giphyIds": [],
				"giphyQuery": "Playmobil"
			}
		},
		{
			"id": "nostalgie-barbie-petshop",
			"category": "nostalgie",
			"a": {
				"name": "Barbie",
				"origin": "Mattel · 1959",
				"line": "Mille métiers, un seul sourire.",
				"giphyIds": [],
				"giphyQuery": "Barbie"
			},
			"b": {
				"name": "Petshop",
				"origin": "Kenner · 1992",
				"line": "Des animaux miniatures à grosse tête.",
				"giphyIds": [],
				"giphyQuery": "Littlest Pet Shop"
			}
		},
		{
			"id": "nostalgie-aol-wanadoo",
			"category": "nostalgie",
			"a": {
				"name": "AOL",
				"origin": "Années 90",
				"line": "« Vous avez du courrier ! »",
				"giphyIds": [],
				"giphyQuery": "AOL dial up"
			},
			"b": {
				"name": "Wanadoo",
				"origin": "France Télécom · 1996",
				"line": "Internet en 56k, et la facture de téléphone.",
				"giphyIds": [],
				"giphyQuery": "internet 90s"
			}
		},
		{
			"id": "nostalgie-cederoms-disquettes",
			"category": "nostalgie",
			"a": {
				"name": "Cédéroms",
				"origin": "Années 90",
				"line": "Une encyclopédie entière sur un disque.",
				"giphyIds": [],
				"giphyQuery": "CD-ROM"
			},
			"b": {
				"name": "Disquettes",
				"origin": "Années 80-90",
				"line": "1,44 Mo, et l’icône « Enregistrer ».",
				"giphyIds": [],
				"giphyQuery": "floppy disk"
			}
		},
		{
			"id": "nostalgie-les-crados-les-stickers-panini",
			"category": "nostalgie",
			"a": {
				"name": "Les Crados",
				"origin": "France · 1986",
				"line": "Des autocollants délicieusement dégoûtants.",
				"giphyIds": [],
				"giphyQuery": "Garbage Pail Kids"
			},
			"b": {
				"name": "Les stickers Panini",
				"origin": "Le foot",
				"line": "Un album, et l’échange des doubles.",
				"giphyIds": [],
				"giphyQuery": "Panini stickers"
			}
		},
		{
			"id": "nostalgie-eurodance-grunge",
			"category": "nostalgie",
			"a": {
				"name": "Eurodance",
				"origin": "Années 90",
				"line": "Des synthés, un rappeur, une chanteuse.",
				"giphyIds": [],
				"giphyQuery": "eurodance"
			},
			"b": {
				"name": "Grunge",
				"origin": "Seattle · années 90",
				"line": "Des chemises à carreaux et des cheveux gras.",
				"giphyIds": [],
				"giphyQuery": "grunge"
			}
		},
		{
			"id": "nostalgie-chair-de-poule-le-club-des-cinq",
			"category": "nostalgie",
			"a": {
				"name": "Chair de poule",
				"origin": "R. L. Stine · 1992",
				"line": "Des livres pour se faire peur sous la couette.",
				"giphyIds": [],
				"giphyQuery": "Goosebumps"
			},
			"b": {
				"name": "Le Club des Cinq",
				"origin": "Enid Blyton · 1942",
				"line": "Quatre enfants, un chien, et des mystères.",
				"giphyIds": [],
				"giphyQuery": "Famous Five"
			}
		},
		{
			"id": "nostalgie-concorde-tgv",
			"category": "nostalgie",
			"a": {
				"name": "Concorde",
				"origin": "Air France · 1976",
				"line": "Paris-New York en trois heures et demie.",
				"giphyIds": [],
				"giphyQuery": "Concorde"
			},
			"b": {
				"name": "TGV",
				"origin": "SNCF · 1981",
				"line": "Le train le plus rapide du pays.",
				"giphyIds": [],
				"giphyQuery": "TGV train"
			}
		},
		{
			"id": "nostalgie-repondeur-cabine-telephonique",
			"category": "nostalgie",
			"a": {
				"name": "Répondeur",
				"origin": "Le salon",
				"line": "« Vous êtes bien chez… »",
				"giphyIds": [],
				"giphyQuery": "answering machine"
			},
			"b": {
				"name": "Cabine téléphonique",
				"origin": "La rue",
				"line": "Une carte à puce et un froid glacial.",
				"giphyIds": [],
				"giphyQuery": "phone booth"
			}
		},
		{
			"id": "sport-lionel-messi-cristiano-ronaldo",
			"category": "sport",
			"a": {
				"name": "Lionel Messi",
				"origin": "Argentine · 2004",
				"line": "Un pied gauche magique, et huit Ballons d’or.",
				"giphyIds": [],
				"giphyQuery": "Messi"
			},
			"b": {
				"name": "Cristiano Ronaldo",
				"origin": "Portugal · 2002",
				"line": "Des abdos, des records, et un célèbre cri de joie.",
				"giphyIds": [],
				"giphyQuery": "Cristiano Ronaldo"
			}
		},
		{
			"id": "sport-roger-federer-rafael-nadal",
			"category": "sport",
			"a": {
				"name": "Roger Federer",
				"origin": "Suisse · 1998",
				"line": "Le revers à une main le plus élégant du monde.",
				"giphyIds": [],
				"giphyQuery": "Roger Federer"
			},
			"b": {
				"name": "Rafael Nadal",
				"origin": "Espagne · 2001",
				"line": "Quatorze Roland-Garros. Quatorze.",
				"giphyIds": [],
				"giphyQuery": "Rafael Nadal"
			}
		},
		{
			"id": "sport-football-rugby",
			"category": "sport",
			"a": {
				"name": "Football",
				"origin": "Partout",
				"line": "Vingt-deux joueurs, un ballon, et des débats sans fin.",
				"giphyIds": [],
				"giphyQuery": "football goal"
			},
			"b": {
				"name": "Rugby",
				"origin": "Le Sud-Ouest",
				"line": "Trente joueurs, un ballon ovale, et une troisième mi-temps.",
				"giphyIds": [],
				"giphyQuery": "rugby tackle"
			}
		},
		{
			"id": "sport-psg-om",
			"category": "sport",
			"a": {
				"name": "PSG",
				"origin": "Paris · 1970",
				"line": "Des stars, du budget, et beaucoup d’attentes.",
				"giphyIds": [],
				"giphyQuery": "Paris Saint-Germain"
			},
			"b": {
				"name": "OM",
				"origin": "Marseille · 1899",
				"line": "Le Vélodrome, la ferveur, et 1993 pour toujours.",
				"giphyIds": [],
				"giphyQuery": "Olympique de Marseille"
			}
		},
		{
			"id": "sport-zinedine-zidane-michel-platini",
			"category": "sport",
			"a": {
				"name": "Zinédine Zidane",
				"origin": "Cannes · 1989",
				"line": "Une roulette, une volée, une légende.",
				"giphyIds": [],
				"giphyQuery": "Zidane"
			},
			"b": {
				"name": "Michel Platini",
				"origin": "Nancy · 1972",
				"line": "Trois Ballons d’or d’affilée.",
				"giphyIds": [],
				"giphyQuery": "football legend"
			}
		},
		{
			"id": "sport-michael-jordan-lebron-james",
			"category": "sport",
			"a": {
				"name": "Michael Jordan",
				"origin": "Chicago · 1984",
				"line": "Six bagues, et la langue tirée.",
				"giphyIds": [],
				"giphyQuery": "Michael Jordan"
			},
			"b": {
				"name": "LeBron James",
				"origin": "Cleveland · 2003",
				"line": "Vingt ans au sommet.",
				"giphyIds": [],
				"giphyQuery": "LeBron James"
			}
		},
		{
			"id": "sport-usain-bolt-carl-lewis",
			"category": "sport",
			"a": {
				"name": "Usain Bolt",
				"origin": "Jamaïque · 2008",
				"line": "Neuf secondes cinquante-huit, et la pose de l’éclair.",
				"giphyIds": [],
				"giphyQuery": "Usain Bolt"
			},
			"b": {
				"name": "Carl Lewis",
				"origin": "États-Unis · 1984",
				"line": "Neuf médailles d’or olympiques.",
				"giphyIds": [],
				"giphyQuery": "Carl Lewis"
			}
		},
		{
			"id": "sport-tour-de-france-roland-garros",
			"category": "sport",
			"a": {
				"name": "Tour de France",
				"origin": "Depuis 1903",
				"line": "Trois semaines de vélo, et le maillot jaune.",
				"giphyIds": [],
				"giphyQuery": "Tour de France"
			},
			"b": {
				"name": "Roland-Garros",
				"origin": "Paris · 1928",
				"line": "La terre battue, et des chaussettes orange.",
				"giphyIds": [],
				"giphyQuery": "Roland Garros"
			}
		},
		{
			"id": "sport-jo-d-ete-jo-d-hiver",
			"category": "sport",
			"a": {
				"name": "JO d’été",
				"origin": "Tous les quatre ans",
				"line": "Le 100 mètres, la natation, et des centaines d’épreuves.",
				"giphyIds": [],
				"giphyQuery": "Olympics summer"
			},
			"b": {
				"name": "JO d’hiver",
				"origin": "Tous les quatre ans",
				"line": "Le ski, le curling, et un froid de canard.",
				"giphyIds": [],
				"giphyQuery": "winter olympics curling"
			}
		},
		{
			"id": "sport-ski-snowboard",
			"category": "sport",
			"a": {
				"name": "Ski",
				"origin": "La station",
				"line": "Deux planches, deux bâtons, et un tire-fesses.",
				"giphyIds": [],
				"giphyQuery": "skiing"
			},
			"b": {
				"name": "Snowboard",
				"origin": "La station",
				"line": "Une planche, et assis au milieu de la piste.",
				"giphyIds": [],
				"giphyQuery": "snowboarding"
			}
		},
		{
			"id": "sport-course-a-pied-velo",
			"category": "sport",
			"a": {
				"name": "Course à pied",
				"origin": "Le parc",
				"line": "Juste des baskets, et beaucoup de volonté.",
				"giphyIds": [],
				"giphyQuery": "running"
			},
			"b": {
				"name": "Vélo",
				"origin": "La route",
				"line": "Des mollets, et un cuissard.",
				"giphyIds": [],
				"giphyQuery": "cycling"
			}
		},
		{
			"id": "sport-muhammad-ali-mike-tyson",
			"category": "sport",
			"a": {
				"name": "Muhammad Ali",
				"origin": "Louisville · 1960",
				"line": "Vole comme un papillon, pique comme une abeille.",
				"giphyIds": [],
				"giphyQuery": "Muhammad Ali"
			},
			"b": {
				"name": "Mike Tyson",
				"origin": "New York · 1985",
				"line": "Le plus jeune champion du monde des lourds.",
				"giphyIds": [],
				"giphyQuery": "Mike Tyson"
			}
		},
		{
			"id": "sport-serena-williams-steffi-graf",
			"category": "sport",
			"a": {
				"name": "Serena Williams",
				"origin": "États-Unis · 1995",
				"line": "Vingt-trois titres du Grand Chelem.",
				"giphyIds": [],
				"giphyQuery": "Serena Williams"
			},
			"b": {
				"name": "Steffi Graf",
				"origin": "Allemagne · 1982",
				"line": "Le Grand Chelem doré, en 1988.",
				"giphyIds": [],
				"giphyQuery": "tennis champion"
			}
		},
		{
			"id": "sport-petanque-molkky",
			"category": "sport",
			"a": {
				"name": "Pétanque",
				"origin": "La Ciotat · 1907",
				"line": "Tu tires ou tu pointes ?",
				"giphyIds": [],
				"giphyQuery": "petanque"
			},
			"b": {
				"name": "Mölkky",
				"origin": "Finlande · 1996",
				"line": "Des quilles en bois, et du calcul mental jusqu’à cinquante.",
				"giphyIds": [],
				"giphyQuery": "molkky"
			}
		},
		{
			"id": "sport-france-98-france-2018",
			"category": "sport",
			"a": {
				"name": "France 98",
				"origin": "Le Stade de France",
				"line": "Deux têtes de Zidane, et les Champs-Élysées.",
				"giphyIds": [],
				"giphyQuery": "France 1998 world cup"
			},
			"b": {
				"name": "France 2018",
				"origin": "Moscou",
				"line": "Une deuxième étoile sur le maillot.",
				"giphyIds": [],
				"giphyQuery": "France 2018 world cup"
			}
		},
		{
			"id": "sport-kylian-mbappe-antoine-griezmann",
			"category": "sport",
			"a": {
				"name": "Kylian Mbappé",
				"origin": "Bondy · 2015",
				"line": "Plus rapide que la défense adverse.",
				"giphyIds": [],
				"giphyQuery": "Mbappe"
			},
			"b": {
				"name": "Antoine Griezmann",
				"origin": "Mâcon · 2009",
				"line": "Des célébrations dansées, et des passes décisives.",
				"giphyIds": [],
				"giphyQuery": "Griezmann"
			}
		},
		{
			"id": "sport-basket-handball",
			"category": "sport",
			"a": {
				"name": "Basket",
				"origin": "Le playground",
				"line": "Des dunks, et des paniers à trois points.",
				"giphyIds": [],
				"giphyQuery": "basketball dunk"
			},
			"b": {
				"name": "Handball",
				"origin": "Le gymnase",
				"line": "Des parades, et des Bleus qui gagnent tout.",
				"giphyIds": [],
				"giphyQuery": "handball"
			}
		},
		{
			"id": "sport-ayrton-senna-alain-prost",
			"category": "sport",
			"a": {
				"name": "Ayrton Senna",
				"origin": "Brésil · 1984",
				"line": "La pluie de Monaco, et une vitesse folle.",
				"giphyIds": [],
				"giphyQuery": "Ayrton Senna"
			},
			"b": {
				"name": "Alain Prost",
				"origin": "France · 1980",
				"line": "Le Professeur, quatre titres mondiaux.",
				"giphyIds": [],
				"giphyQuery": "Formula 1 vintage"
			}
		},
		{
			"id": "sport-lewis-hamilton-michael-schumacher",
			"category": "sport",
			"a": {
				"name": "Lewis Hamilton",
				"origin": "Royaume-Uni · 2007",
				"line": "Sept titres mondiaux, et beaucoup de style.",
				"giphyIds": [],
				"giphyQuery": "Lewis Hamilton"
			},
			"b": {
				"name": "Michael Schumacher",
				"origin": "Allemagne · 1991",
				"line": "Sept titres, et une Ferrari rouge.",
				"giphyIds": [],
				"giphyQuery": "Michael Schumacher Ferrari"
			}
		},
		{
			"id": "sport-tony-parker-victor-wembanyama",
			"category": "sport",
			"a": {
				"name": "Tony Parker",
				"origin": "San Antonio · 2001",
				"line": "Quatre bagues avec les Spurs.",
				"giphyIds": [],
				"giphyQuery": "Tony Parker"
			},
			"b": {
				"name": "Victor Wembanyama",
				"origin": "San Antonio · 2023",
				"line": "Plus de deux mètres vingt, et des bras sans fin.",
				"giphyIds": [],
				"giphyQuery": "Wembanyama"
			}
		},
		{
			"id": "sport-teddy-riner-laure-manaudou",
			"category": "sport",
			"a": {
				"name": "Teddy Riner",
				"origin": "Judo · 2007",
				"line": "Le géant du judo, et des titres à la pelle.",
				"giphyIds": [],
				"giphyQuery": "Teddy Riner"
			},
			"b": {
				"name": "Laure Manaudou",
				"origin": "Natation · 2004",
				"line": "Championne olympique à dix-sept ans.",
				"giphyIds": [],
				"giphyQuery": "swimming champion"
			}
		},
		{
			"id": "sport-leon-marchand-florent-manaudou",
			"category": "sport",
			"a": {
				"name": "Léon Marchand",
				"origin": "Toulouse · 2024",
				"line": "Quatre médailles d’or à Paris, en une semaine.",
				"giphyIds": [],
				"giphyQuery": "Leon Marchand"
			},
			"b": {
				"name": "Florent Manaudou",
				"origin": "Natation · 2012",
				"line": "Champion olympique du 50 mètres.",
				"giphyIds": [],
				"giphyQuery": "swimming race"
			}
		},
		{
			"id": "sport-au-stade-devant-la-tele",
			"category": "sport",
			"a": {
				"name": "Au stade",
				"origin": "Les tribunes",
				"line": "Les chants, les écharpes, et la pluie.",
				"giphyIds": [],
				"giphyQuery": "stadium crowd"
			},
			"b": {
				"name": "Devant la télé",
				"origin": "Le canapé",
				"line": "Le replay, les ralentis, et le chauffage.",
				"giphyIds": [],
				"giphyQuery": "watching sports tv"
			}
		},
		{
			"id": "sport-yoga-crossfit",
			"category": "sport",
			"a": {
				"name": "Yoga",
				"origin": "Le tapis",
				"line": "Respirer, s’étirer, et chercher son chakra.",
				"giphyIds": [],
				"giphyQuery": "yoga"
			},
			"b": {
				"name": "CrossFit",
				"origin": "La box",
				"line": "Soulever, sauter, et en parler à tout le monde.",
				"giphyIds": [],
				"giphyQuery": "crossfit"
			}
		},
		{
			"id": "sport-salle-de-sport-sport-dehors",
			"category": "sport",
			"a": {
				"name": "Salle de sport",
				"origin": "L’abonnement",
				"line": "Des machines, des miroirs, et la musique trop fort.",
				"giphyIds": [],
				"giphyQuery": "gym workout"
			},
			"b": {
				"name": "Sport dehors",
				"origin": "Le grand air",
				"line": "Le soleil, la pluie, et pas d’abonnement.",
				"giphyIds": [],
				"giphyQuery": "outdoor workout"
			}
		},
		{
			"id": "sport-golf-tennis",
			"category": "sport",
			"a": {
				"name": "Golf",
				"origin": "Le green",
				"line": "Quatre heures de marche, pour une toute petite balle.",
				"giphyIds": [],
				"giphyQuery": "golf swing"
			},
			"b": {
				"name": "Tennis",
				"origin": "Le court",
				"line": "Deux joueurs, un filet, et des cris.",
				"giphyIds": [],
				"giphyQuery": "tennis"
			}
		},
		{
			"id": "sport-footing-du-dimanche-grasse-matinee",
			"category": "sport",
			"a": {
				"name": "Footing du dimanche",
				"origin": "9 heures du matin",
				"line": "Dix kilomètres, et l’impression d’être un héros.",
				"giphyIds": [],
				"giphyQuery": "morning run"
			},
			"b": {
				"name": "Grasse matinée",
				"origin": "9 heures du matin",
				"line": "Dix heures de sommeil, et l’impression d’être un héros aussi.",
				"giphyIds": [],
				"giphyQuery": "sleeping in"
			}
		},
		{
			"id": "sport-thierry-henry-david-trezeguet",
			"category": "sport",
			"a": {
				"name": "Thierry Henry",
				"origin": "Arsenal · 1999",
				"line": "Le roi d’Highbury.",
				"giphyIds": [],
				"giphyQuery": "Thierry Henry"
			},
			"b": {
				"name": "David Trezeguet",
				"origin": "Juventus · 2000",
				"line": "Le but en or de l’Euro 2000.",
				"giphyIds": [],
				"giphyQuery": "golden goal"
			}
		},
		{
			"id": "sport-fabien-barthez-hugo-lloris",
			"category": "sport",
			"a": {
				"name": "Fabien Barthez",
				"origin": "Équipe de France · 1994",
				"line": "Un crâne embrassé avant chaque match.",
				"giphyIds": [],
				"giphyQuery": "goalkeeper save"
			},
			"b": {
				"name": "Hugo Lloris",
				"origin": "Équipe de France · 2008",
				"line": "Capitaine, et une Coupe du monde soulevée.",
				"giphyIds": [],
				"giphyQuery": "goalkeeper trophy"
			}
		},
		{
			"id": "sport-coupe-du-monde-ligue-des-champions",
			"category": "sport",
			"a": {
				"name": "Coupe du monde",
				"origin": "Tous les quatre ans",
				"line": "Tout le pays devant la télé.",
				"giphyIds": [],
				"giphyQuery": "World Cup trophy"
			},
			"b": {
				"name": "Ligue des champions",
				"origin": "Le mardi soir",
				"line": "L’hymne, les étoiles, et les grandes soirées.",
				"giphyIds": [],
				"giphyQuery": "Champions League"
			}
		},
		{
			"id": "sport-arbitrage-video-arbitre-seul",
			"category": "sport",
			"a": {
				"name": "Arbitrage vidéo",
				"origin": "La VAR",
				"line": "La justice, après quatre minutes d’attente.",
				"giphyIds": [],
				"giphyQuery": "VAR referee"
			},
			"b": {
				"name": "Arbitre seul",
				"origin": "Le terrain",
				"line": "Une décision immédiate, et des polémiques éternelles.",
				"giphyIds": [],
				"giphyQuery": "referee whistle"
			}
		},
		{
			"id": "sport-pele-diego-maradona",
			"category": "sport",
			"a": {
				"name": "Pelé",
				"origin": "Brésil · 1956",
				"line": "Trois Coupes du monde.",
				"giphyIds": [],
				"giphyQuery": "Pele"
			},
			"b": {
				"name": "Diego Maradona",
				"origin": "Argentine · 1976",
				"line": "La main de Dieu, puis le but du siècle.",
				"giphyIds": [],
				"giphyQuery": "Maradona"
			}
		},
		{
			"id": "sport-valentino-rossi-marc-marquez",
			"category": "sport",
			"a": {
				"name": "Valentino Rossi",
				"origin": "Italie · 1996",
				"line": "Le Docteur, neuf titres mondiaux.",
				"giphyIds": [],
				"giphyQuery": "Valentino Rossi"
			},
			"b": {
				"name": "Marc Márquez",
				"origin": "Espagne · 2008",
				"line": "Le genou par terre, et le coude aussi.",
				"giphyIds": [],
				"giphyQuery": "Marc Marquez"
			}
		},
		{
			"id": "sport-sebastien-loeb-sebastien-ogier",
			"category": "sport",
			"a": {
				"name": "Sébastien Loeb",
				"origin": "France · 2002",
				"line": "Neuf titres de champion du monde des rallyes.",
				"giphyIds": [],
				"giphyQuery": "Sebastien Loeb"
			},
			"b": {
				"name": "Sébastien Ogier",
				"origin": "France · 2008",
				"line": "L’autre Sébastien, tout aussi titré.",
				"giphyIds": [],
				"giphyQuery": "rally car"
			}
		},
		{
			"id": "sport-ceremonie-d-ouverture-ceremonie-de-cloture",
			"category": "sport",
			"a": {
				"name": "Cérémonie d’ouverture",
				"origin": "Paris · 2024",
				"line": "La Seine, la pluie, et Céline Dion sur la tour Eiffel.",
				"giphyIds": [],
				"giphyQuery": "Paris 2024 opening ceremony"
			},
			"b": {
				"name": "Cérémonie de clôture",
				"origin": "Paris · 2024",
				"line": "Tom Cruise, une moto, et le drapeau pour Los Angeles.",
				"giphyIds": [],
				"giphyQuery": "Tom Cruise"
			}
		},
		{
			"id": "sport-sport-d-equipe-sport-individuel",
			"category": "sport",
			"a": {
				"name": "Sport d’équipe",
				"origin": "Le vestiaire",
				"line": "On gagne ensemble, on perd ensemble.",
				"giphyIds": [],
				"giphyQuery": "team celebration"
			},
			"b": {
				"name": "Sport individuel",
				"origin": "Toi contre toi",
				"line": "Toute la gloire, et toute la pression.",
				"giphyIds": [],
				"giphyQuery": "solo athlete"
			}
		},
		{
			"id": "sport-flechettes-billard",
			"category": "sport",
			"a": {
				"name": "Fléchettes",
				"origin": "Le pub",
				"line": "Viser le triple 20, toucher le mur.",
				"giphyIds": [],
				"giphyQuery": "darts"
			},
			"b": {
				"name": "Billard",
				"origin": "Le bar",
				"line": "De la craie, des angles, et un peu de frime.",
				"giphyIds": [],
				"giphyQuery": "billiards"
			}
		},
		{
			"id": "sport-baby-foot-ping-pong",
			"category": "sport",
			"a": {
				"name": "Baby-foot",
				"origin": "Le café",
				"line": "Interdit de faire tourner les barres.",
				"giphyIds": [],
				"giphyQuery": "foosball"
			},
			"b": {
				"name": "Ping-pong",
				"origin": "Le garage",
				"line": "Une raquette, une balle, et la table pliante.",
				"giphyIds": [],
				"giphyQuery": "ping pong"
			}
		},
		{
			"id": "sport-les-bleus-le-xv-de-france",
			"category": "sport",
			"a": {
				"name": "Les Bleus",
				"origin": "Le foot",
				"line": "Deux étoiles sur le maillot.",
				"giphyIds": [],
				"giphyQuery": "France football team"
			},
			"b": {
				"name": "Le XV de France",
				"origin": "Le rugby",
				"line": "Le coq, la Marseillaise, et le Tournoi des Six Nations.",
				"giphyIds": [],
				"giphyQuery": "France rugby"
			}
		},
		{
			"id": "sport-antoine-dupont-sebastien-chabal",
			"category": "sport",
			"a": {
				"name": "Antoine Dupont",
				"origin": "Toulouse · 2014",
				"line": "Le meilleur joueur du monde, à quinze et à sept.",
				"giphyIds": [],
				"giphyQuery": "Antoine Dupont"
			},
			"b": {
				"name": "Sébastien Chabal",
				"origin": "France · 1998",
				"line": "La barbe, les cheveux, et les plaquages.",
				"giphyIds": [],
				"giphyQuery": "rugby player beard"
			}
		},
		{
			"id": "sport-echecs-poker",
			"category": "sport",
			"a": {
				"name": "Échecs",
				"origin": "L’échiquier",
				"line": "Soixante-quatre cases et des heures de réflexion.",
				"giphyIds": [],
				"giphyQuery": "chess"
			},
			"b": {
				"name": "Poker",
				"origin": "La table verte",
				"line": "Des cartes, des jetons, et une tête impassible.",
				"giphyIds": [],
				"giphyQuery": "poker face"
			}
		},
		{
			"id": "sport-magnus-carlsen-garry-kasparov",
			"category": "sport",
			"a": {
				"name": "Magnus Carlsen",
				"origin": "Norvège · 2004",
				"line": "Champion du monde, et numéro un depuis une éternité.",
				"giphyIds": [],
				"giphyQuery": "Magnus Carlsen"
			},
			"b": {
				"name": "Garry Kasparov",
				"origin": "Russie · 1985",
				"line": "Le champion qui a affronté Deep Blue.",
				"giphyIds": [],
				"giphyQuery": "chess grandmaster"
			}
		},
		{
			"id": "sport-escalade-randonnee",
			"category": "sport",
			"a": {
				"name": "Escalade",
				"origin": "La falaise",
				"line": "Les doigts dans la magnésie, la tête dans le vide.",
				"giphyIds": [],
				"giphyQuery": "rock climbing"
			},
			"b": {
				"name": "Randonnée",
				"origin": "Le sentier",
				"line": "Un sac, des chaussures, et un sandwich au sommet.",
				"giphyIds": [],
				"giphyQuery": "hiking"
			}
		},
		{
			"id": "sport-marathon-semi-marathon",
			"category": "sport",
			"a": {
				"name": "Marathon",
				"origin": "42,195 km",
				"line": "Des ampoules, et une médaille.",
				"giphyIds": [],
				"giphyQuery": "marathon finish"
			},
			"b": {
				"name": "Semi-marathon",
				"origin": "21,1 km",
				"line": "La moitié de la souffrance.",
				"giphyIds": [],
				"giphyQuery": "running race"
			}
		},
		{
			"id": "sport-le-sport-a-la-tele-le-sport-en-vrai",
			"category": "sport",
			"a": {
				"name": "Le sport à la télé",
				"origin": "Le canapé",
				"line": "Expert en tactique, sans se lever.",
				"giphyIds": [],
				"giphyQuery": "armchair coach"
			},
			"b": {
				"name": "Le sport en vrai",
				"origin": "Le terrain",
				"line": "Moins d’opinions, plus de courbatures.",
				"giphyIds": [],
				"giphyQuery": "sore muscles"
			}
		},
		{
			"id": "sport-boxe-judo",
			"category": "sport",
			"a": {
				"name": "Boxe",
				"origin": "Le ring",
				"line": "Des gants, des rounds, et un protège-dents.",
				"giphyIds": [],
				"giphyQuery": "boxing"
			},
			"b": {
				"name": "Judo",
				"origin": "Le tatami",
				"line": "Un kimono, une ceinture, et des chutes maîtrisées.",
				"giphyIds": [],
				"giphyQuery": "judo"
			}
		},
		{
			"id": "sport-le-peloton-du-tour-le-velo-du-dimanche",
			"category": "sport",
			"a": {
				"name": "Le peloton du Tour",
				"origin": "Le Tour de France",
				"line": "Deux cents kilomètres par jour, à quarante à l’heure.",
				"giphyIds": [],
				"giphyQuery": "peloton"
			},
			"b": {
				"name": "Le vélo du dimanche",
				"origin": "La campagne",
				"line": "Vingt kilomètres, et une pause à la boulangerie.",
				"giphyIds": [],
				"giphyQuery": "sunday bike ride"
			}
		},
		{
			"id": "sport-gardien-de-but-attaquant",
			"category": "sport",
			"a": {
				"name": "Gardien de but",
				"origin": "La cage",
				"line": "Tout le monde t’oublie, sauf quand tu rates.",
				"giphyIds": [],
				"giphyQuery": "goalkeeper"
			},
			"b": {
				"name": "Attaquant",
				"origin": "La surface",
				"line": "Tout le monde t’aime, surtout quand tu marques.",
				"giphyIds": [],
				"giphyQuery": "striker goal celebration"
			}
		},
		{
			"id": "sport-harlem-globetrotters-washington-generals",
			"category": "sport",
			"a": {
				"name": "Harlem Globetrotters",
				"origin": "États-Unis · 1926",
				"line": "Du basket, et des tours de magie avec le ballon.",
				"giphyIds": [],
				"giphyQuery": "Harlem Globetrotters"
			},
			"b": {
				"name": "Washington Generals",
				"origin": "États-Unis · 1952",
				"line": "L’équipe qui perd tous ses matchs depuis des décennies.",
				"giphyIds": [],
				"giphyQuery": "losing team"
			}
		},
		{
			"id": "sport-la-ola-le-clapping-viking",
			"category": "sport",
			"a": {
				"name": "La ola",
				"origin": "Le stade",
				"line": "Tout le stade se lève, puis se rassoit.",
				"giphyIds": [],
				"giphyQuery": "stadium wave"
			},
			"b": {
				"name": "Le clapping viking",
				"origin": "L’Islande · 2016",
				"line": "Un « hou ! », un clap, et l’Euro 2016.",
				"giphyIds": [],
				"giphyQuery": "Iceland thunderclap"
			}
		},
		{
			"id": "mode-barbe-rase-de-pres",
			"category": "mode",
			"a": {
				"name": "Barbe",
				"origin": "Le visage",
				"line": "Trois semaines de patience et un peigne.",
				"giphyIds": [],
				"giphyQuery": "beard"
			},
			"b": {
				"name": "Rasé de près",
				"origin": "La salle de bains",
				"line": "Lisse, net, et sans miettes de pain.",
				"giphyIds": [],
				"giphyQuery": "shaving"
			}
		},
		{
			"id": "mode-crocs-birkenstock",
			"category": "mode",
			"a": {
				"name": "Crocs",
				"origin": "Colorado · 2002",
				"line": "Moches, confortables, et parfaitement assumées.",
				"giphyIds": [],
				"giphyQuery": "Crocs shoes"
			},
			"b": {
				"name": "Birkenstock",
				"origin": "Allemagne · 1774",
				"line": "Des sandales orthopédiques, devenues cool.",
				"giphyIds": [],
				"giphyQuery": "Birkenstock"
			}
		},
		{
			"id": "mode-jogging-jean",
			"category": "mode",
			"a": {
				"name": "Jogging",
				"origin": "Le canapé",
				"line": "Confortable, élastique, et sans jugement.",
				"giphyIds": [],
				"giphyQuery": "sweatpants"
			},
			"b": {
				"name": "Jean",
				"origin": "La garde-robe",
				"line": "Il va avec tout, sauf avec un deuxième jean.",
				"giphyIds": [],
				"giphyQuery": "denim jeans"
			}
		},
		{
			"id": "mode-pour-contre",
			"category": "mode",
			"question": "Les chaussettes dans les sandales : pour ou contre ?",
			"a": {
				"name": "Pour",
				"origin": "Les audacieux",
				"line": "Des chaussettes, et des sandales. Le confort avant tout.",
				"giphyIds": [],
				"giphyQuery": "socks and sandals"
			},
			"b": {
				"name": "Contre",
				"origin": "Les gardiens du style",
				"line": "Il y a des règles. Celle-ci en est une.",
				"giphyIds": [],
				"giphyQuery": "fashion police"
			}
		},
		{
			"id": "mode-cheveux-longs-cheveux-courts",
			"category": "mode",
			"a": {
				"name": "Cheveux longs",
				"origin": "La crinière",
				"line": "Libres, au vent, et dans la soupe.",
				"giphyIds": [],
				"giphyQuery": "long hair flip"
			},
			"b": {
				"name": "Cheveux courts",
				"origin": "Le coiffeur",
				"line": "Trois minutes de séchage, et c’est réglé.",
				"giphyIds": [],
				"giphyQuery": "short haircut"
			}
		},
		{
			"id": "mode-lunettes-lentilles",
			"category": "mode",
			"a": {
				"name": "Lunettes",
				"origin": "Le nez",
				"line": "On voit bien, sauf quand il pleut.",
				"giphyIds": [],
				"giphyQuery": "glasses"
			},
			"b": {
				"name": "Lentilles",
				"origin": "Les yeux",
				"line": "On voit bien, et on les cherche sur le lavabo.",
				"giphyIds": [],
				"giphyQuery": "contact lenses"
			}
		},
		{
			"id": "mode-baskets-chaussures-de-ville",
			"category": "mode",
			"a": {
				"name": "Baskets",
				"origin": "Les pieds",
				"line": "Confort absolu, pour toutes les occasions.",
				"giphyIds": [],
				"giphyQuery": "sneakers"
			},
			"b": {
				"name": "Chaussures de ville",
				"origin": "Les pieds, le lundi",
				"line": "Élégantes, et des ampoules en prime.",
				"giphyIds": [],
				"giphyQuery": "dress shoes"
			}
		},
		{
			"id": "mode-costume-tenue-decontractee",
			"category": "mode",
			"a": {
				"name": "Costume",
				"origin": "Le bureau",
				"line": "Sérieux, cravaté, et un peu serré.",
				"giphyIds": [],
				"giphyQuery": "business suit"
			},
			"b": {
				"name": "Tenue décontractée",
				"origin": "Le bureau aussi",
				"line": "Un sweat, et des idées.",
				"giphyIds": [],
				"giphyQuery": "casual friday"
			}
		},
		{
			"id": "mode-pyjama-t-shirt-xxl",
			"category": "mode",
			"question": "Pour dormir : pyjama ou vieux t-shirt ?",
			"a": {
				"name": "Pyjama",
				"origin": "La chambre",
				"line": "Un vrai pyjama, assorti, et repassé.",
				"giphyIds": [],
				"giphyQuery": "pajamas"
			},
			"b": {
				"name": "T-shirt XXL",
				"origin": "La chambre",
				"line": "Un vieux t-shirt de concert, trois tailles trop grand.",
				"giphyIds": [],
				"giphyQuery": "oversized t-shirt"
			}
		},
		{
			"id": "mode-moustache-bouc",
			"category": "mode",
			"a": {
				"name": "Moustache",
				"origin": "La lèvre du haut",
				"line": "Un accessoire, et un caractère.",
				"giphyIds": [],
				"giphyQuery": "mustache"
			},
			"b": {
				"name": "Bouc",
				"origin": "Le menton",
				"line": "Une petite touche, juste en bas.",
				"giphyIds": [],
				"giphyQuery": "goatee"
			}
		},
		{
			"id": "mode-tatouage-peau-nature",
			"category": "mode",
			"a": {
				"name": "Tatouage",
				"origin": "La peau",
				"line": "Une histoire gravée pour toujours.",
				"giphyIds": [],
				"giphyQuery": "tattoo"
			},
			"b": {
				"name": "Peau nature",
				"origin": "La peau aussi",
				"line": "Une toile vierge, et aucun regret.",
				"giphyIds": [],
				"giphyQuery": "clean skin"
			}
		},
		{
			"id": "mode-bonnet-casquette",
			"category": "mode",
			"a": {
				"name": "Bonnet",
				"origin": "La tête, en hiver",
				"line": "Chaud, mais adieu le brushing.",
				"giphyIds": [],
				"giphyQuery": "beanie"
			},
			"b": {
				"name": "Casquette",
				"origin": "La tête, en été",
				"line": "Protège du soleil, et des mauvais jours de cheveux.",
				"giphyIds": [],
				"giphyQuery": "cap"
			}
		},
		{
			"id": "mode-echarpe-col-roule",
			"category": "mode",
			"a": {
				"name": "Écharpe",
				"origin": "Le cou",
				"line": "Trois tours, et on ne voit plus le menton.",
				"giphyIds": [],
				"giphyQuery": "scarf"
			},
			"b": {
				"name": "Col roulé",
				"origin": "Le cou aussi",
				"line": "L’écharpe intégrée, version philosophe.",
				"giphyIds": [],
				"giphyQuery": "turtleneck"
			}
		},
		{
			"id": "mode-sac-a-dos-sac-en-bandouliere",
			"category": "mode",
			"a": {
				"name": "Sac à dos",
				"origin": "Le dos",
				"line": "Les deux bretelles, la posture parfaite.",
				"giphyIds": [],
				"giphyQuery": "backpack"
			},
			"b": {
				"name": "Sac en bandoulière",
				"origin": "L’épaule",
				"line": "Une seule bretelle, et le style.",
				"giphyIds": [],
				"giphyQuery": "crossbody bag"
			}
		},
		{
			"id": "mode-montre-telephone",
			"category": "mode",
			"question": "Pour savoir l’heure : montre ou téléphone ?",
			"a": {
				"name": "Montre",
				"origin": "Le poignet",
				"line": "Pour savoir l’heure, et pour le style.",
				"giphyIds": [],
				"giphyQuery": "wristwatch"
			},
			"b": {
				"name": "Téléphone",
				"origin": "La poche",
				"line": "Pour savoir l’heure, et regarder ses messages au passage.",
				"giphyIds": [],
				"giphyQuery": "checking phone time"
			}
		},
		{
			"id": "mode-talons-baskets-plates",
			"category": "mode",
			"a": {
				"name": "Talons",
				"origin": "Les grandes occasions",
				"line": "Dix centimètres de plus, et de la prestance.",
				"giphyIds": [],
				"giphyQuery": "high heels"
			},
			"b": {
				"name": "Baskets plates",
				"origin": "Toutes les occasions",
				"line": "Dix centimètres de moins, et dix kilomètres de plus.",
				"giphyIds": [],
				"giphyQuery": "flat sneakers"
			}
		},
		{
			"id": "mode-cravate-n-ud-papillon",
			"category": "mode",
			"a": {
				"name": "Cravate",
				"origin": "Le col",
				"line": "Un nœud classique, et le sérieux.",
				"giphyIds": [],
				"giphyQuery": "necktie"
			},
			"b": {
				"name": "Nœud papillon",
				"origin": "Le col aussi",
				"line": "Un nœud plus court, et plus de fantaisie.",
				"giphyIds": [],
				"giphyQuery": "bow tie"
			}
		},
		{
			"id": "mode-chemise-rentree-chemise-sortie",
			"category": "mode",
			"a": {
				"name": "Chemise rentrée",
				"origin": "La ceinture",
				"line": "Net, propre, réglementaire.",
				"giphyIds": [],
				"giphyQuery": "tucked shirt"
			},
			"b": {
				"name": "Chemise sortie",
				"origin": "La liberté",
				"line": "Décontracté, et ça cache le dessert.",
				"giphyIds": [],
				"giphyQuery": "untucked shirt"
			}
		},
		{
			"id": "mode-mulet-coupe-au-bol",
			"category": "mode",
			"a": {
				"name": "Mulet",
				"origin": "Les années 80",
				"line": "Court devant, long derrière. Business devant, fête derrière.",
				"giphyIds": [],
				"giphyQuery": "mullet"
			},
			"b": {
				"name": "Coupe au bol",
				"origin": "Les années 90",
				"line": "Un bol, une paire de ciseaux, et le tour est joué.",
				"giphyIds": [],
				"giphyQuery": "bowl cut"
			}
		},
		{
			"id": "mode-doudoune-parka",
			"category": "mode",
			"a": {
				"name": "Doudoune",
				"origin": "L’hiver",
				"line": "Gonflée, chaude, et un bruit de froissement.",
				"giphyIds": [],
				"giphyQuery": "puffer jacket"
			},
			"b": {
				"name": "Parka",
				"origin": "L’hiver aussi",
				"line": "Une capuche en fausse fourrure, et l’air de partir en expédition.",
				"giphyIds": [],
				"giphyQuery": "parka"
			}
		},
		{
			"id": "mode-pull-de-noel-moche-pull-elegant",
			"category": "mode",
			"a": {
				"name": "Pull de Noël moche",
				"origin": "Décembre",
				"line": "Un renne qui clignote, et beaucoup d’autodérision.",
				"giphyIds": [],
				"giphyQuery": "ugly christmas sweater"
			},
			"b": {
				"name": "Pull élégant",
				"origin": "Décembre aussi",
				"line": "Du cachemire, et aucune lumière.",
				"giphyIds": [],
				"giphyQuery": "cashmere sweater"
			}
		},
		{
			"id": "mode-lunettes-rondes-lunettes-aviateur",
			"category": "mode",
			"a": {
				"name": "Lunettes rondes",
				"origin": "Le nez",
				"line": "L’air intellectuel, et un peu sorcier.",
				"giphyIds": [],
				"giphyQuery": "round glasses"
			},
			"b": {
				"name": "Lunettes aviateur",
				"origin": "Le nez aussi",
				"line": "L’air de pilote, même dans le métro.",
				"giphyIds": [],
				"giphyQuery": "aviator sunglasses"
			}
		},
		{
			"id": "mode-couleurs-vives-noir-integral",
			"category": "mode",
			"a": {
				"name": "Couleurs vives",
				"origin": "La garde-robe",
				"line": "Du jaune, du rose, et de la bonne humeur.",
				"giphyIds": [],
				"giphyQuery": "colorful outfit"
			},
			"b": {
				"name": "Noir intégral",
				"origin": "La garde-robe aussi",
				"line": "Élégant, discret, et facile à assortir.",
				"giphyIds": [],
				"giphyQuery": "all black outfit"
			}
		},
		{
			"id": "mode-imprime-leopard-mariniere",
			"category": "mode",
			"a": {
				"name": "Imprimé léopard",
				"origin": "Le dressing",
				"line": "Rugissant, et jamais discret.",
				"giphyIds": [],
				"giphyQuery": "leopard print"
			},
			"b": {
				"name": "Marinière",
				"origin": "La Bretagne",
				"line": "Des rayures, et un air de vacances.",
				"giphyIds": [],
				"giphyQuery": "breton stripes"
			}
		},
		{
			"id": "mode-friperie-neuf",
			"category": "mode",
			"a": {
				"name": "Friperie",
				"origin": "Le vide-dressing",
				"line": "Une pièce unique, et une histoire.",
				"giphyIds": [],
				"giphyQuery": "thrift shopping"
			},
			"b": {
				"name": "Neuf",
				"origin": "Le magasin",
				"line": "Une étiquette, et l’odeur du neuf.",
				"giphyIds": [],
				"giphyQuery": "new clothes"
			}
		},
		{
			"id": "mode-uniforme-tenue-libre",
			"category": "mode",
			"a": {
				"name": "Uniforme",
				"origin": "L’école",
				"line": "Tout le monde pareil, aucun débat le matin.",
				"giphyIds": [],
				"giphyQuery": "school uniform"
			},
			"b": {
				"name": "Tenue libre",
				"origin": "L’école aussi",
				"line": "Chacun son style, et des débats tous les matins.",
				"giphyIds": [],
				"giphyQuery": "kids outfit"
			}
		},
		{
			"id": "mode-kilt-pantalon",
			"category": "mode",
			"a": {
				"name": "Kilt",
				"origin": "L’Écosse",
				"line": "Du tartan, et une bonne aération.",
				"giphyIds": [],
				"giphyQuery": "kilt"
			},
			"b": {
				"name": "Pantalon",
				"origin": "Partout",
				"line": "Deux jambes, et aucune question.",
				"giphyIds": [],
				"giphyQuery": "trousers"
			}
		},
		{
			"id": "mode-beret-chapeau-de-paille",
			"category": "mode",
			"a": {
				"name": "Béret",
				"origin": "Le Pays basque",
				"line": "La touche française, version cliché.",
				"giphyIds": [],
				"giphyQuery": "beret"
			},
			"b": {
				"name": "Chapeau de paille",
				"origin": "La plage",
				"line": "L’été, le soleil, et l’ombre portative.",
				"giphyIds": [],
				"giphyQuery": "straw hat"
			}
		},
		{
			"id": "mode-bretelles-ceinture",
			"category": "mode",
			"a": {
				"name": "Bretelles",
				"origin": "Les épaules",
				"line": "Un pantalon qui tient, et du style.",
				"giphyIds": [],
				"giphyQuery": "suspenders"
			},
			"b": {
				"name": "Ceinture",
				"origin": "La taille",
				"line": "Le grand classique, et des trous à rajouter.",
				"giphyIds": [],
				"giphyQuery": "belt"
			}
		},
		{
			"id": "mode-brushing-coiffe-decoiffe",
			"category": "mode",
			"a": {
				"name": "Brushing",
				"origin": "Le salon de coiffure",
				"line": "Parfait, lisse, et interdit de pleuvoir.",
				"giphyIds": [],
				"giphyQuery": "blowout hair"
			},
			"b": {
				"name": "Coiffé-décoiffé",
				"origin": "Le réveil",
				"line": "Naturel, et parfois vraiment décoiffé.",
				"giphyIds": [],
				"giphyQuery": "messy hair"
			}
		},
		{
			"id": "mode-cheveux-gris-assumes-coloration",
			"category": "mode",
			"a": {
				"name": "Cheveux gris assumés",
				"origin": "Le temps qui passe",
				"line": "Le sel, sans le poivre, et avec fierté.",
				"giphyIds": [],
				"giphyQuery": "gray hair"
			},
			"b": {
				"name": "Coloration",
				"origin": "Le salon de coiffure",
				"line": "Une couleur choisie, et des racines à surveiller.",
				"giphyIds": [],
				"giphyQuery": "hair dye"
			}
		},
		{
			"id": "mode-parfum-discret-parfum-fort",
			"category": "mode",
			"a": {
				"name": "Parfum discret",
				"origin": "Le cou",
				"line": "On le sent quand on s’approche.",
				"giphyIds": [],
				"giphyQuery": "perfume"
			},
			"b": {
				"name": "Parfum fort",
				"origin": "Tout l’ascenseur",
				"line": "On le sent depuis le hall.",
				"giphyIds": [],
				"giphyQuery": "perfume spray"
			}
		},
		{
			"id": "mode-repasse-froisse-assume",
			"category": "mode",
			"a": {
				"name": "Repassé",
				"origin": "La planche à repasser",
				"line": "Pas un pli, pas un défaut.",
				"giphyIds": [],
				"giphyQuery": "ironing"
			},
			"b": {
				"name": "Froissé assumé",
				"origin": "Le sèche-linge",
				"line": "C’est du lin. C’est voulu.",
				"giphyIds": [],
				"giphyQuery": "wrinkled shirt"
			}
		},
		{
			"id": "mode-sandales-tongs",
			"category": "mode",
			"a": {
				"name": "Sandales",
				"origin": "L’été",
				"line": "Des lanières, et des marques de bronzage.",
				"giphyIds": [],
				"giphyQuery": "sandals"
			},
			"b": {
				"name": "Tongs",
				"origin": "La plage",
				"line": "Le clac-clac de l’été.",
				"giphyIds": [],
				"giphyQuery": "flip flops"
			}
		},
		{
			"id": "mode-chaussettes-assorties-chaussettes-depareillees",
			"category": "mode",
			"a": {
				"name": "Chaussettes assorties",
				"origin": "Le tiroir bien rangé",
				"line": "Deux chaussettes, une paire.",
				"giphyIds": [],
				"giphyQuery": "matching socks"
			},
			"b": {
				"name": "Chaussettes dépareillées",
				"origin": "Le tiroir en bazar",
				"line": "Une rayée, une à pois, et une personnalité.",
				"giphyIds": [],
				"giphyQuery": "mismatched socks"
			}
		},
		{
			"id": "mode-pyjama-toute-la-journee-s-habiller-quand-meme",
			"category": "mode",
			"a": {
				"name": "Pyjama toute la journée",
				"origin": "Le télétravail",
				"line": "En bas : pyjama. En haut : chemise pour la visio.",
				"giphyIds": [],
				"giphyQuery": "pajama day"
			},
			"b": {
				"name": "S’habiller quand même",
				"origin": "Le télétravail aussi",
				"line": "Une vraie tenue, même pour le salon.",
				"giphyIds": [],
				"giphyQuery": "getting dressed"
			}
		},
		{
			"id": "mode-doudoune-sans-manches-gilet-en-laine",
			"category": "mode",
			"a": {
				"name": "Doudoune sans manches",
				"origin": "Le dirigeant de start-up",
				"line": "Chaud au cœur, froid aux bras.",
				"giphyIds": [],
				"giphyQuery": "puffer vest"
			},
			"b": {
				"name": "Gilet en laine",
				"origin": "Le grand-père cool",
				"line": "Des boutons, et beaucoup de charme.",
				"giphyIds": [],
				"giphyQuery": "cardigan"
			}
		},
		{
			"id": "mode-tenue-de-sport-en-ville-tenue-de-sport-pour-le-sport",
			"category": "mode",
			"a": {
				"name": "Tenue de sport en ville",
				"origin": "Le quotidien",
				"line": "Leggings, baskets, et pas de sport prévu.",
				"giphyIds": [],
				"giphyQuery": "athleisure"
			},
			"b": {
				"name": "Tenue de sport pour le sport",
				"origin": "La salle",
				"line": "Elle transpire, comme prévu.",
				"giphyIds": [],
				"giphyQuery": "gym clothes"
			}
		},
		{
			"id": "mode-total-look-jean-un-seul-jean",
			"category": "mode",
			"a": {
				"name": "Total look jean",
				"origin": "La tête aux pieds",
				"line": "Une veste en jean sur un jean. Audacieux.",
				"giphyIds": [],
				"giphyQuery": "denim on denim"
			},
			"b": {
				"name": "Un seul jean",
				"origin": "La garde-robe",
				"line": "Un jean, et autre chose. Prudent.",
				"giphyIds": [],
				"giphyQuery": "jeans outfit"
			}
		},
		{
			"id": "mode-moustache-en-guidon-moustache-fine",
			"category": "mode",
			"a": {
				"name": "Moustache en guidon",
				"origin": "Le barbier",
				"line": "Recourbée, cirée, et très sérieuse.",
				"giphyIds": [],
				"giphyQuery": "handlebar mustache"
			},
			"b": {
				"name": "Moustache fine",
				"origin": "Le cinéma d’autrefois",
				"line": "Un trait de crayon, et beaucoup de charme.",
				"giphyIds": [],
				"giphyQuery": "thin mustache"
			}
		},
		{
			"id": "mode-sourcils-fins-sourcils-epais",
			"category": "mode",
			"a": {
				"name": "Sourcils fins",
				"origin": "Les années 90",
				"line": "Épilés, très fins, très surpris.",
				"giphyIds": [],
				"giphyQuery": "thin eyebrows"
			},
			"b": {
				"name": "Sourcils épais",
				"origin": "Les années 2010",
				"line": "Naturels, brossés, et très expressifs.",
				"giphyIds": [],
				"giphyQuery": "thick eyebrows"
			}
		},
		{
			"id": "mode-bob-chapeau-de-cow-boy",
			"category": "mode",
			"a": {
				"name": "Bob",
				"origin": "Le festival",
				"line": "Un chapeau mou, et l’été en musique.",
				"giphyIds": [],
				"giphyQuery": "bucket hat"
			},
			"b": {
				"name": "Chapeau de cow-boy",
				"origin": "Le Far West",
				"line": "Un large bord, et beaucoup d’assurance.",
				"giphyIds": [],
				"giphyQuery": "cowboy hat"
			}
		},
		{
			"id": "mode-bijoux-discrets-gros-bijoux",
			"category": "mode",
			"a": {
				"name": "Bijoux discrets",
				"origin": "Le quotidien",
				"line": "Une petite chaîne, et beaucoup de goût.",
				"giphyIds": [],
				"giphyQuery": "delicate necklace"
			},
			"b": {
				"name": "Gros bijoux",
				"origin": "Les soirées",
				"line": "Des chaînes en or, et on te voit de loin.",
				"giphyIds": [],
				"giphyQuery": "gold chains bling"
			}
		},
		{
			"id": "mode-montre-connectee-montre-a-aiguilles",
			"category": "mode",
			"a": {
				"name": "Montre connectée",
				"origin": "Le poignet",
				"line": "Tes pas, ton cœur, tes messages. Et l’heure.",
				"giphyIds": [],
				"giphyQuery": "smartwatch"
			},
			"b": {
				"name": "Montre à aiguilles",
				"origin": "Le poignet aussi",
				"line": "Juste l’heure, et ça suffit.",
				"giphyIds": [],
				"giphyQuery": "analog watch"
			}
		},
		{
			"id": "mode-faire-les-soldes-eviter-les-soldes",
			"category": "mode",
			"a": {
				"name": "Faire les soldes",
				"origin": "Janvier et juillet",
				"line": "Des étiquettes rouges et des coudes bien placés.",
				"giphyIds": [],
				"giphyQuery": "sale shopping crowd"
			},
			"b": {
				"name": "Éviter les soldes",
				"origin": "Janvier et juillet",
				"line": "Pas de cohue, et pas de remise.",
				"giphyIds": [],
				"giphyQuery": "calm shopping"
			}
		},
		{
			"id": "mode-cabine-d-essayage-commande-en-ligne",
			"category": "mode",
			"a": {
				"name": "Cabine d’essayage",
				"origin": "Le magasin",
				"line": "Un miroir, une lumière cruelle, et la vérité.",
				"giphyIds": [],
				"giphyQuery": "fitting room"
			},
			"b": {
				"name": "Commande en ligne",
				"origin": "Le canapé",
				"line": "Trois tailles commandées, deux renvoyées.",
				"giphyIds": [],
				"giphyQuery": "online shopping package"
			}
		},
		{
			"id": "mode-haute-couture-pret-a-porter",
			"category": "mode",
			"a": {
				"name": "Haute couture",
				"origin": "Paris",
				"line": "Des pièces uniques, et des mois de travail.",
				"giphyIds": [],
				"giphyQuery": "fashion runway"
			},
			"b": {
				"name": "Prêt-à-porter",
				"origin": "Partout",
				"line": "Les mêmes idées, en taille M.",
				"giphyIds": [],
				"giphyQuery": "clothing store"
			}
		},
		{
			"id": "mode-chaussons-pieds-nus",
			"category": "mode",
			"a": {
				"name": "Chaussons",
				"origin": "La maison",
				"line": "Doux, chauds, et un peu ridicules.",
				"giphyIds": [],
				"giphyQuery": "slippers"
			},
			"b": {
				"name": "Pieds nus",
				"origin": "La maison aussi",
				"line": "Libres, et sur la pièce de Lego.",
				"giphyIds": [],
				"giphyQuery": "barefoot"
			}
		},
		{
			"id": "autos-peugeot-renault",
			"category": "autos",
			"a": {
				"name": "Peugeot",
				"origin": "Sochaux · 1810",
				"line": "Un lion sur la calandre.",
				"giphyIds": [],
				"giphyQuery": "Peugeot"
			},
			"b": {
				"name": "Renault",
				"origin": "Boulogne-Billancourt · 1898",
				"line": "Un losange, et la 4L dans le cœur.",
				"giphyIds": [],
				"giphyQuery": "Renault"
			}
		},
		{
			"id": "autos-citroen-volkswagen",
			"category": "autos",
			"a": {
				"name": "Citroën",
				"origin": "Paris · 1919",
				"line": "Deux chevrons, la 2 CV et la DS.",
				"giphyIds": [],
				"giphyQuery": "Citroen"
			},
			"b": {
				"name": "Volkswagen",
				"origin": "Wolfsburg · 1937",
				"line": "La Coccinelle, la Golf, et le Combi.",
				"giphyIds": [],
				"giphyQuery": "Volkswagen"
			}
		},
		{
			"id": "autos-ferrari-lamborghini",
			"category": "autos",
			"a": {
				"name": "Ferrari",
				"origin": "Maranello · 1947",
				"line": "Rouge, cheval cabré, et un son inimitable.",
				"giphyIds": [],
				"giphyQuery": "Ferrari"
			},
			"b": {
				"name": "Lamborghini",
				"origin": "Sant’Agata · 1963",
				"line": "Un taureau, et des portes en ciseaux.",
				"giphyIds": [],
				"giphyQuery": "Lamborghini"
			}
		},
		{
			"id": "autos-porsche-aston-martin",
			"category": "autos",
			"a": {
				"name": "Porsche",
				"origin": "Stuttgart · 1931",
				"line": "La 911, toujours la même, toujours parfaite.",
				"giphyIds": [],
				"giphyQuery": "Porsche 911"
			},
			"b": {
				"name": "Aston Martin",
				"origin": "Royaume-Uni · 1913",
				"line": "La voiture de James Bond.",
				"giphyIds": [],
				"giphyQuery": "Aston Martin"
			}
		},
		{
			"id": "autos-bmw-mercedes-benz",
			"category": "autos",
			"a": {
				"name": "BMW",
				"origin": "Munich · 1916",
				"line": "L’hélice, la propulsion, et le plaisir de conduire.",
				"giphyIds": [],
				"giphyQuery": "BMW"
			},
			"b": {
				"name": "Mercedes-Benz",
				"origin": "Stuttgart · 1926",
				"line": "L’étoile à trois branches, et des taxis increvables.",
				"giphyIds": [],
				"giphyQuery": "Mercedes Benz"
			}
		},
		{
			"id": "autos-audi-volvo",
			"category": "autos",
			"a": {
				"name": "Audi",
				"origin": "Ingolstadt · 1909",
				"line": "Quatre anneaux, et la transmission quattro.",
				"giphyIds": [],
				"giphyQuery": "Audi quattro"
			},
			"b": {
				"name": "Volvo",
				"origin": "Göteborg · 1927",
				"line": "La sécurité avant tout, et des breaks rectangulaires.",
				"giphyIds": [],
				"giphyQuery": "Volvo"
			}
		},
		{
			"id": "autos-tesla-toyota",
			"category": "autos",
			"a": {
				"name": "Tesla",
				"origin": "Californie · 2003",
				"line": "Électrique, et des mises à jour à distance.",
				"giphyIds": [],
				"giphyQuery": "Tesla"
			},
			"b": {
				"name": "Toyota",
				"origin": "Japon · 1937",
				"line": "La Prius, et des voitures qui ne tombent jamais en panne.",
				"giphyIds": [],
				"giphyQuery": "Toyota"
			}
		},
		{
			"id": "autos-fiat-500-mini",
			"category": "autos",
			"a": {
				"name": "Fiat 500",
				"origin": "Turin · 1957",
				"line": "Minuscule, ronde, italienne.",
				"giphyIds": [],
				"giphyQuery": "Fiat 500"
			},
			"b": {
				"name": "Mini",
				"origin": "Royaume-Uni · 1959",
				"line": "Minuscule, carrée, britannique.",
				"giphyIds": [],
				"giphyQuery": "Mini Cooper"
			}
		},
		{
			"id": "autos-jeep-land-rover",
			"category": "autos",
			"a": {
				"name": "Jeep",
				"origin": "États-Unis · 1941",
				"line": "Partout, même là où il n’y a pas de route.",
				"giphyIds": [],
				"giphyQuery": "Jeep offroad"
			},
			"b": {
				"name": "Land Rover",
				"origin": "Royaume-Uni · 1948",
				"line": "Le Defender, indestructible et anglais.",
				"giphyIds": [],
				"giphyQuery": "Land Rover Defender"
			}
		},
		{
			"id": "autos-dacia-skoda",
			"category": "autos",
			"a": {
				"name": "Dacia",
				"origin": "Roumanie · 1966",
				"line": "Pas chère, solide, et sans chichis.",
				"giphyIds": [],
				"giphyQuery": "Dacia"
			},
			"b": {
				"name": "Škoda",
				"origin": "Tchéquie · 1895",
				"line": "Du sérieux, et une flèche à plumes sur le capot.",
				"giphyIds": [],
				"giphyQuery": "Skoda"
			}
		},
		{
			"id": "autos-alpine-bugatti",
			"category": "autos",
			"a": {
				"name": "Alpine",
				"origin": "Dieppe · 1955",
				"line": "Bleue, légère, et faite pour les virages.",
				"giphyIds": [],
				"giphyQuery": "Alpine A110"
			},
			"b": {
				"name": "Bugatti",
				"origin": "Molsheim · 1909",
				"line": "Plus de 400 km/h, et un prix à la hauteur.",
				"giphyIds": [],
				"giphyQuery": "Bugatti"
			}
		},
		{
			"id": "autos-ford-mustang-chevrolet-camaro",
			"category": "autos",
			"a": {
				"name": "Ford Mustang",
				"origin": "Ford · 1964",
				"line": "Le muscle car par excellence.",
				"giphyIds": [],
				"giphyQuery": "Ford Mustang"
			},
			"b": {
				"name": "Chevrolet Camaro",
				"origin": "Chevrolet · 1966",
				"line": "Sa rivale de toujours.",
				"giphyIds": [],
				"giphyQuery": "Chevrolet Camaro"
			}
		},
		{
			"id": "autos-harley-davidson-ducati",
			"category": "autos",
			"a": {
				"name": "Harley-Davidson",
				"origin": "Milwaukee · 1903",
				"line": "Un V-twin, du chrome, et la route 66.",
				"giphyIds": [],
				"giphyQuery": "Harley Davidson"
			},
			"b": {
				"name": "Ducati",
				"origin": "Bologne · 1926",
				"line": "Rouge, italienne, et un bruit unique.",
				"giphyIds": [],
				"giphyQuery": "Ducati"
			}
		},
		{
			"id": "autos-yamaha-honda",
			"category": "autos",
			"a": {
				"name": "Yamaha",
				"origin": "Japon · 1955",
				"line": "Des diapasons sur le logo, et des motos sur la piste.",
				"giphyIds": [],
				"giphyQuery": "Yamaha motorcycle"
			},
			"b": {
				"name": "Honda",
				"origin": "Japon · 1948",
				"line": "Des millions de Super Cub, et la Goldwing.",
				"giphyIds": [],
				"giphyQuery": "Honda motorcycle"
			}
		},
		{
			"id": "autos-kawasaki-suzuki",
			"category": "autos",
			"a": {
				"name": "Kawasaki",
				"origin": "Japon · années 1950",
				"line": "Vert, et une réputation de fusée.",
				"giphyIds": [],
				"giphyQuery": "Kawasaki Ninja"
			},
			"b": {
				"name": "Suzuki",
				"origin": "Japon · 1952",
				"line": "La Hayabusa, le faucon des autoroutes.",
				"giphyIds": [],
				"giphyQuery": "Suzuki Hayabusa"
			}
		},
		{
			"id": "autos-ktm-husqvarna",
			"category": "autos",
			"a": {
				"name": "KTM",
				"origin": "Autriche · 1953",
				"line": "Orange, et ça grimpe partout.",
				"giphyIds": [],
				"giphyQuery": "KTM dirt bike"
			},
			"b": {
				"name": "Husqvarna",
				"origin": "Suède · 1903",
				"line": "Un nom que l’on retrouve aussi sur des tronçonneuses.",
				"giphyIds": [],
				"giphyQuery": "Husqvarna motocross"
			}
		},
		{
			"id": "autos-vespa-lambretta",
			"category": "autos",
			"a": {
				"name": "Vespa",
				"origin": "Italie · 1946",
				"line": "Rome, deux roues, et l’élégance.",
				"giphyIds": [],
				"giphyQuery": "Vespa"
			},
			"b": {
				"name": "Lambretta",
				"origin": "Italie · 1947",
				"line": "L’autre scooter italien, et les mods.",
				"giphyIds": [],
				"giphyQuery": "Lambretta scooter"
			}
		},
		{
			"id": "autos-triumph-royal-enfield",
			"category": "autos",
			"a": {
				"name": "Triumph",
				"origin": "Royaume-Uni · 1902",
				"line": "La Bonneville, et la classe anglaise.",
				"giphyIds": [],
				"giphyQuery": "Triumph motorcycle"
			},
			"b": {
				"name": "Royal Enfield",
				"origin": "Royaume-Uni puis Inde · 1901",
				"line": "L’une des plus anciennes marques de moto encore en vie.",
				"giphyIds": [],
				"giphyQuery": "Royal Enfield"
			}
		},
		{
			"id": "autos-bmw-motorrad-moto-guzzi",
			"category": "autos",
			"a": {
				"name": "BMW Motorrad",
				"origin": "Munich · 1923",
				"line": "Le flat-twin, et des GS qui font le tour du monde.",
				"giphyIds": [],
				"giphyQuery": "BMW GS adventure"
			},
			"b": {
				"name": "Moto Guzzi",
				"origin": "Italie · 1921",
				"line": "Un V-twin en travers, et un aigle.",
				"giphyIds": [],
				"giphyQuery": "Moto Guzzi"
			}
		},
		{
			"id": "autos-peugeot-205-gti-golf-gti",
			"category": "autos",
			"a": {
				"name": "Peugeot 205 GTI",
				"origin": "Peugeot · 1984",
				"line": "La GTI que tout le monde voulait.",
				"giphyIds": [],
				"giphyQuery": "Peugeot 205 GTI"
			},
			"b": {
				"name": "Golf GTI",
				"origin": "Volkswagen · 1976",
				"line": "L’inventrice de la sportive compacte.",
				"giphyIds": [],
				"giphyQuery": "Golf GTI"
			}
		},
		{
			"id": "autos-renault-5-citroen-ax",
			"category": "autos",
			"a": {
				"name": "Renault 5",
				"origin": "Renault · 1972",
				"line": "La petite citadine, revenue en électrique.",
				"giphyIds": [],
				"giphyQuery": "Renault 5"
			},
			"b": {
				"name": "Citroën AX",
				"origin": "Citroën · 1986",
				"line": "Légère, sobre, et des records de consommation.",
				"giphyIds": [],
				"giphyQuery": "small car"
			}
		},
		{
			"id": "autos-2-cv-4l",
			"category": "autos",
			"a": {
				"name": "2 CV",
				"origin": "Citroën · 1948",
				"line": "Quatre roues sous un parapluie.",
				"giphyIds": [],
				"giphyQuery": "Citroen 2CV"
			},
			"b": {
				"name": "4L",
				"origin": "Renault · 1961",
				"line": "Indestructible, et pourtant tout le monde en a cassé une.",
				"giphyIds": [],
				"giphyQuery": "Renault 4"
			}
		},
		{
			"id": "autos-ds-traction-avant",
			"category": "autos",
			"a": {
				"name": "DS",
				"origin": "Citroën · 1955",
				"line": "La suspension hydropneumatique, et une ligne de soucoupe.",
				"giphyIds": [],
				"giphyQuery": "Citroen DS"
			},
			"b": {
				"name": "Traction Avant",
				"origin": "Citroën · 1934",
				"line": "La voiture des gangsters de cinéma.",
				"giphyIds": [],
				"giphyQuery": "vintage car gangster"
			}
		},
		{
			"id": "autos-formule-1-rallye",
			"category": "autos",
			"a": {
				"name": "Formule 1",
				"origin": "Les circuits",
				"line": "Des pneus changés en deux secondes.",
				"giphyIds": [],
				"giphyQuery": "Formula 1 pit stop"
			},
			"b": {
				"name": "Rallye",
				"origin": "Les routes de terre",
				"line": "De la neige, de la boue, et un copilote qui lit des notes.",
				"giphyIds": [],
				"giphyQuery": "rally car jump"
			}
		},
		{
			"id": "autos-24-heures-du-mans-dakar",
			"category": "autos",
			"a": {
				"name": "24 Heures du Mans",
				"origin": "Le Mans · 1923",
				"line": "Rouler un jour entier, sans s’arrêter.",
				"giphyIds": [],
				"giphyQuery": "Le Mans 24 hours"
			},
			"b": {
				"name": "Dakar",
				"origin": "Depuis 1978",
				"line": "Le désert, des dunes, et le GPS qui hésite.",
				"giphyIds": [],
				"giphyQuery": "Dakar rally"
			}
		},
		{
			"id": "autos-boite-automatique-boite-manuelle",
			"category": "autos",
			"a": {
				"name": "Boîte automatique",
				"origin": "Le levier sur D",
				"line": "On avance, on freine, c’est tout.",
				"giphyIds": [],
				"giphyQuery": "automatic car"
			},
			"b": {
				"name": "Boîte manuelle",
				"origin": "Le levier et l’embrayage",
				"line": "Le plaisir de passer les vitesses. Et de caler.",
				"giphyIds": [],
				"giphyQuery": "manual gear shift"
			}
		},
		{
			"id": "autos-diesel-essence",
			"category": "autos",
			"a": {
				"name": "Diesel",
				"origin": "La pompe noire",
				"line": "Du couple, et des kilomètres à la pelle.",
				"giphyIds": [],
				"giphyQuery": "diesel engine"
			},
			"b": {
				"name": "Essence",
				"origin": "La pompe verte",
				"line": "Plus de nervosité, et plus de passages à la pompe.",
				"giphyIds": [],
				"giphyQuery": "gas station"
			}
		},
		{
			"id": "autos-electrique-thermique",
			"category": "autos",
			"a": {
				"name": "Électrique",
				"origin": "La borne",
				"line": "Silencieuse, et la course aux bornes de recharge.",
				"giphyIds": [],
				"giphyQuery": "electric car charging"
			},
			"b": {
				"name": "Thermique",
				"origin": "La station-service",
				"line": "Du bruit, de l’odeur, et le plein en trois minutes.",
				"giphyIds": [],
				"giphyQuery": "engine revving"
			}
		},
		{
			"id": "autos-cabriolet-toit-fixe",
			"category": "autos",
			"a": {
				"name": "Cabriolet",
				"origin": "Le toit ouvert",
				"line": "Les cheveux au vent, et les coups de soleil.",
				"giphyIds": [],
				"giphyQuery": "convertible car"
			},
			"b": {
				"name": "Toit fixe",
				"origin": "Le toit fermé",
				"line": "La pluie dehors, la musique dedans.",
				"giphyIds": [],
				"giphyQuery": "car rain"
			}
		},
		{
			"id": "autos-suv-citadine",
			"category": "autos",
			"a": {
				"name": "SUV",
				"origin": "La route",
				"line": "Haut, large, et la vue sur tout le monde.",
				"giphyIds": [],
				"giphyQuery": "SUV"
			},
			"b": {
				"name": "Citadine",
				"origin": "La ville",
				"line": "Petite, et elle se gare partout.",
				"giphyIds": [],
				"giphyQuery": "small car parking"
			}
		},
		{
			"id": "autos-break-monospace",
			"category": "autos",
			"a": {
				"name": "Break",
				"origin": "Les vacances",
				"line": "Le coffre géant et le chien à l’arrière.",
				"giphyIds": [],
				"giphyQuery": "station wagon"
			},
			"b": {
				"name": "Monospace",
				"origin": "Les vacances aussi",
				"line": "Sept places, et un film sur la tablette.",
				"giphyIds": [],
				"giphyQuery": "minivan"
			}
		},
		{
			"id": "autos-moto-scooter",
			"category": "autos",
			"a": {
				"name": "Moto",
				"origin": "La route",
				"line": "Une vraie machine, et des vibrations.",
				"giphyIds": [],
				"giphyQuery": "motorcycle ride"
			},
			"b": {
				"name": "Scooter",
				"origin": "La ville",
				"line": "Un coffre sous la selle, et zéro bouchon.",
				"giphyIds": [],
				"giphyQuery": "scooter city"
			}
		},
		{
			"id": "autos-sportive-trail",
			"category": "autos",
			"a": {
				"name": "Sportive",
				"origin": "Le circuit",
				"line": "Le genou au sol, en théorie.",
				"giphyIds": [],
				"giphyQuery": "sport bike"
			},
			"b": {
				"name": "Trail",
				"origin": "Le chemin",
				"line": "Partir loin, même sans route.",
				"giphyIds": [],
				"giphyQuery": "adventure motorcycle"
			}
		},
		{
			"id": "autos-custom-roadster",
			"category": "autos",
			"a": {
				"name": "Custom",
				"origin": "La route 66",
				"line": "Les pieds en avant, et le temps de vivre.",
				"giphyIds": [],
				"giphyQuery": "cruiser motorcycle"
			},
			"b": {
				"name": "Roadster",
				"origin": "La départementale",
				"line": "Pas de carénage, et un vrai caractère.",
				"giphyIds": [],
				"giphyQuery": "naked bike"
			}
		},
		{
			"id": "autos-conduite-a-droite-conduite-a-gauche",
			"category": "autos",
			"a": {
				"name": "Conduite à droite",
				"origin": "La France",
				"line": "La voie de droite, comme presque partout.",
				"giphyIds": [],
				"giphyQuery": "driving car"
			},
			"b": {
				"name": "Conduite à gauche",
				"origin": "Le Royaume-Uni",
				"line": "La voie de gauche, avec le flegme en prime.",
				"giphyIds": [],
				"giphyQuery": "british driving"
			}
		},
		{
			"id": "autos-gps-carte-routiere",
			"category": "autos",
			"a": {
				"name": "GPS",
				"origin": "Le tableau de bord",
				"line": "« Faites demi-tour dès que possible. »",
				"giphyIds": [],
				"giphyQuery": "GPS navigation"
			},
			"b": {
				"name": "Carte routière",
				"origin": "La boîte à gants",
				"line": "Impossible à replier, et toujours là quand il n’y a plus de réseau.",
				"giphyIds": [],
				"giphyQuery": "road map"
			}
		},
		{
			"id": "autos-lavage-a-la-main-station-de-lavage",
			"category": "autos",
			"a": {
				"name": "Lavage à la main",
				"origin": "L’allée",
				"line": "Un seau, une éponge, et le dimanche après-midi.",
				"giphyIds": [],
				"giphyQuery": "washing car"
			},
			"b": {
				"name": "Station de lavage",
				"origin": "La sortie de ville",
				"line": "Les rouleaux géants, et la peur de l’antenne.",
				"giphyIds": [],
				"giphyQuery": "car wash"
			}
		},
		{
			"id": "autos-coccinelle-combi",
			"category": "autos",
			"a": {
				"name": "Coccinelle",
				"origin": "Volkswagen · 1938",
				"line": "La voiture du peuple, devenue icône.",
				"giphyIds": [],
				"giphyQuery": "VW Beetle"
			},
			"b": {
				"name": "Combi",
				"origin": "Volkswagen · 1950",
				"line": "Le van des surfeurs et des hippies.",
				"giphyIds": [],
				"giphyQuery": "VW camper van"
			}
		},
		{
			"id": "autos-lada-niva-trabant",
			"category": "autos",
			"a": {
				"name": "Lada Niva",
				"origin": "URSS · 1977",
				"line": "Rustique, et elle passe partout.",
				"giphyIds": [],
				"giphyQuery": "Lada Niva"
			},
			"b": {
				"name": "Trabant",
				"origin": "RDA · 1957",
				"line": "Une carrosserie en plastique, et un moteur deux-temps.",
				"giphyIds": [],
				"giphyQuery": "Trabant"
			}
		},
		{
			"id": "autos-rolls-royce-bentley",
			"category": "autos",
			"a": {
				"name": "Rolls-Royce",
				"origin": "Royaume-Uni · 1904",
				"line": "Le silence, et une statuette sur le capot.",
				"giphyIds": [],
				"giphyQuery": "Rolls Royce"
			},
			"b": {
				"name": "Bentley",
				"origin": "Royaume-Uni · 1919",
				"line": "Le luxe, en plus sportif.",
				"giphyIds": [],
				"giphyQuery": "Bentley"
			}
		},
		{
			"id": "autos-maserati-alfa-romeo",
			"category": "autos",
			"a": {
				"name": "Maserati",
				"origin": "Bologne · 1914",
				"line": "Un trident sur la calandre.",
				"giphyIds": [],
				"giphyQuery": "Maserati"
			},
			"b": {
				"name": "Alfa Romeo",
				"origin": "Milan · 1910",
				"line": "Un serpent, une croix, et du caractère.",
				"giphyIds": [],
				"giphyQuery": "Alfa Romeo"
			}
		},
		{
			"id": "autos-mclaren-lotus",
			"category": "autos",
			"a": {
				"name": "McLaren",
				"origin": "Royaume-Uni · 1963",
				"line": "Orange papaye, et la Formule 1 dans le sang.",
				"giphyIds": [],
				"giphyQuery": "McLaren"
			},
			"b": {
				"name": "Lotus",
				"origin": "Royaume-Uni · 1948",
				"line": "La légèreté avant tout.",
				"giphyIds": [],
				"giphyQuery": "Lotus car"
			}
		},
		{
			"id": "autos-subaru-mitsubishi",
			"category": "autos",
			"a": {
				"name": "Subaru",
				"origin": "Japon · 1953",
				"line": "Des Impreza bleues, et des rallyes.",
				"giphyIds": [],
				"giphyQuery": "Subaru Impreza rally"
			},
			"b": {
				"name": "Mitsubishi",
				"origin": "Japon · 1970",
				"line": "La Lancer Evolution, et des rallyes aussi.",
				"giphyIds": [],
				"giphyQuery": "Mitsubishi Lancer Evolution"
			}
		},
		{
			"id": "autos-nissan-gt-r-toyota-supra",
			"category": "autos",
			"a": {
				"name": "Nissan GT-R",
				"origin": "Nissan · 2007",
				"line": "Surnommée Godzilla.",
				"giphyIds": [],
				"giphyQuery": "Nissan GT-R"
			},
			"b": {
				"name": "Toyota Supra",
				"origin": "Toyota · 1978",
				"line": "Une star de Fast and Furious.",
				"giphyIds": [],
				"giphyQuery": "Toyota Supra"
			}
		},
		{
			"id": "autos-indian-harley-davidson",
			"category": "autos",
			"a": {
				"name": "Indian",
				"origin": "Springfield · 1901",
				"line": "La plus ancienne marque de moto américaine.",
				"giphyIds": [],
				"giphyQuery": "Indian motorcycle"
			},
			"b": {
				"name": "Harley-Davidson",
				"origin": "Milwaukee · 1903",
				"line": "La plus célèbre.",
				"giphyIds": [],
				"giphyQuery": "Harley Davidson ride"
			}
		},
		{
			"id": "autos-deux-temps-quatre-temps",
			"category": "autos",
			"a": {
				"name": "Deux-temps",
				"origin": "Le moteur qui chante",
				"line": "Ça fume, ça hurle, et ça sent l’huile.",
				"giphyIds": [],
				"giphyQuery": "two stroke dirt bike"
			},
			"b": {
				"name": "Quatre-temps",
				"origin": "Le moteur sage",
				"line": "Plus propre, plus coupleux, plus lourd.",
				"giphyIds": [],
				"giphyQuery": "four stroke engine"
			}
		},
		{
			"id": "autos-casque-integral-casque-jet",
			"category": "autos",
			"a": {
				"name": "Casque intégral",
				"origin": "La tête entière",
				"line": "Tout protégé, et la visière qui s’embue.",
				"giphyIds": [],
				"giphyQuery": "full face helmet"
			},
			"b": {
				"name": "Casque jet",
				"origin": "Le visage à l’air",
				"line": "Le vent sur les joues, et les moucherons aussi.",
				"giphyIds": [],
				"giphyQuery": "open face helmet"
			}
		},
		{
			"id": "autos-le-v-de-la-main-le-hochement-de-tete",
			"category": "autos",
			"a": {
				"name": "Le V de la main",
				"origin": "Les motards",
				"line": "Deux doigts tendus vers le bas, la fraternité.",
				"giphyIds": [],
				"giphyQuery": "motorcycle wave"
			},
			"b": {
				"name": "Le hochement de tête",
				"origin": "Les motards aussi",
				"line": "Un petit signe du casque, la même fraternité.",
				"giphyIds": [],
				"giphyQuery": "nod"
			}
		},
		{
			"id": "autos-mehari-mini-moke",
			"category": "autos",
			"a": {
				"name": "Méhari",
				"origin": "Citroën · 1968",
				"line": "Une voiture en plastique, faite pour la plage.",
				"giphyIds": [],
				"giphyQuery": "Citroen Mehari"
			},
			"b": {
				"name": "Mini Moke",
				"origin": "Royaume-Uni · 1964",
				"line": "La jeep de plage britannique.",
				"giphyIds": [],
				"giphyQuery": "Mini Moke"
			}
		},
		{
			"id": "autos-taxi-jaune-black-cab",
			"category": "autos",
			"a": {
				"name": "Taxi jaune",
				"origin": "New York",
				"line": "Le klaxon, et un chauffeur pressé.",
				"giphyIds": [],
				"giphyQuery": "New York taxi"
			},
			"b": {
				"name": "Black cab",
				"origin": "Londres",
				"line": "Noir, rond, et le meilleur plan de la ville.",
				"giphyIds": [],
				"giphyQuery": "London black cab"
			}
		},
		{
			"id": "mode-queue-de-cheval-cheveux-laches",
			"category": "mode",
			"a": {
				"name": "Queue de cheval",
				"origin": "Le poignet, un élastique toujours prêt",
				"line": "Pratique, rapide, et les cheveux hors du chemin.",
				"giphyIds": [],
				"giphyQuery": "ponytail"
			},
			"b": {
				"name": "Cheveux lâchés",
				"origin": "Le vent",
				"line": "Libres, et dans les yeux au premier coup de vent.",
				"giphyIds": [],
				"giphyQuery": "hair flip wind"
			}
		},
		{
			"id": "mode-chaussettes-hautes-socquettes-invisibles",
			"category": "mode",
			"a": {
				"name": "Chaussettes hautes",
				"origin": "Les mollets",
				"line": "Remontées jusqu’en haut, et assumées.",
				"giphyIds": [],
				"giphyQuery": "high socks"
			},
			"b": {
				"name": "Socquettes invisibles",
				"origin": "Le fond de la chaussure",
				"line": "Elles disparaissent. Dans la chaussure, et dans la machine.",
				"giphyIds": [],
				"giphyQuery": "ankle socks"
			}
		},
		{
			"id": "dilemmes-plus-jamais-dormir-plus-jamais-manger",
			"category": "dilemmes",
			"question": "Tu préfères ne plus jamais dormir, ou ne plus jamais manger ?",
			"a": {
				"name": "Plus jamais dormir",
				"origin": "Les nuits blanches",
				"line": "Vingt-quatre heures par jour pour tout faire. Et regarder des séries.",
				"giphyIds": [],
				"giphyQuery": "insomnia awake"
			},
			"b": {
				"name": "Plus jamais manger",
				"origin": "La cuisine vide",
				"line": "Plus de courses, plus de vaisselle, plus de raclette.",
				"giphyIds": [],
				"giphyQuery": "empty plate"
			}
		},
		{
			"id": "dilemmes-des-mains-aux-pieds-des-pieds-aux-mains",
			"category": "dilemmes",
			"question": "Tu préfères avoir des mains à la place des pieds, ou des pieds à la place des mains ?",
			"a": {
				"name": "Des mains aux pieds",
				"origin": "La salle de gym",
				"line": "Tu marches à quatre pattes, mais tu applaudis avec les pieds.",
				"giphyIds": [],
				"giphyQuery": "hands walking"
			},
			"b": {
				"name": "Des pieds aux mains",
				"origin": "Le bureau",
				"line": "Tu tapes au clavier avec des orteils. Bon courage.",
				"giphyIds": [],
				"giphyQuery": "feet typing"
			}
		},
		{
			"id": "dilemmes-toujours-en-retard-toujours-en-avance",
			"category": "dilemmes",
			"question": "Tu préfères être toujours en retard de 10 minutes, ou en avance de 20 minutes ?",
			"a": {
				"name": "Toujours en retard",
				"origin": "Dix minutes, chaque fois",
				"line": "Tu rates le début de tous les films.",
				"giphyIds": [],
				"giphyQuery": "running late"
			},
			"b": {
				"name": "Toujours en avance",
				"origin": "Vingt minutes, chaque fois",
				"line": "Tu attends tout le monde, devant la porte, dans le froid.",
				"giphyIds": [],
				"giphyQuery": "waiting early"
			}
		},
		{
			"id": "dilemmes-chanter-danser",
			"category": "dilemmes",
			"question": "Tu préfères chanter tout ce que tu dis, ou danser partout où tu marches ?",
			"a": {
				"name": "Chanter",
				"origin": "Ta voix, en permanence",
				"line": "Chaque phrase devient une comédie musicale.",
				"giphyIds": [],
				"giphyQuery": "singing"
			},
			"b": {
				"name": "Danser",
				"origin": "Tes jambes, en permanence",
				"line": "Chaque déplacement devient un clip.",
				"giphyIds": [],
				"giphyQuery": "dancing walk"
			}
		},
		{
			"id": "dilemmes-toujours-trop-chaud-toujours-trop-froid",
			"category": "dilemmes",
			"question": "Tu préfères avoir toujours trop chaud, ou toujours trop froid ?",
			"a": {
				"name": "Toujours trop chaud",
				"origin": "Ta peau",
				"line": "Tu transpires même en janvier.",
				"giphyIds": [],
				"giphyQuery": "sweating hot"
			},
			"b": {
				"name": "Toujours trop froid",
				"origin": "Ta peau",
				"line": "Tu portes une écharpe même en août.",
				"giphyIds": [],
				"giphyQuery": "freezing cold"
			}
		},
		{
			"id": "dilemmes-un-bouton-pause-un-bouton-retour",
			"category": "dilemmes",
			"question": "Pour ta vie, tu préfères un bouton pause, ou un bouton retour arrière ?",
			"a": {
				"name": "Un bouton pause",
				"origin": "Ta vie",
				"line": "Tout s’arrête, sauf toi.",
				"giphyIds": [],
				"giphyQuery": "pause button"
			},
			"b": {
				"name": "Un bouton retour",
				"origin": "Ta vie",
				"line": "Tu peux défaire ta dernière bêtise.",
				"giphyIds": [],
				"giphyQuery": "rewind button"
			}
		},
		{
			"id": "dilemmes-la-meme-journee-une-annee-sautee",
			"category": "dilemmes",
			"question": "Tu préfères revivre sans fin la même journée, ou sauter une année entière ?",
			"a": {
				"name": "La même journée",
				"origin": "Un jour sans fin",
				"line": "Revivre le même jour, encore et encore.",
				"giphyIds": [],
				"giphyQuery": "groundhog day"
			},
			"b": {
				"name": "Une année sautée",
				"origin": "Le futur",
				"line": "Tu te réveilles un an plus tard, sans rien avoir vu.",
				"giphyIds": [],
				"giphyQuery": "time skip"
			}
		},
		{
			"id": "dilemmes-sans-musique-sans-films",
			"category": "dilemmes",
			"question": "Tu préfères vivre sans musique, ou sans films ?",
			"a": {
				"name": "Sans musique",
				"origin": "Le silence",
				"line": "Plus aucune chanson, jamais.",
				"giphyIds": [],
				"giphyQuery": "silence"
			},
			"b": {
				"name": "Sans films",
				"origin": "L’écran noir",
				"line": "Plus aucun film, jamais.",
				"giphyIds": [],
				"giphyQuery": "black screen"
			}
		},
		{
			"id": "dilemmes-sans-internet-sans-telephone",
			"category": "dilemmes",
			"question": "Tu préfères vivre sans Internet, ou sans téléphone ?",
			"a": {
				"name": "Sans Internet",
				"origin": "La vie d’avant",
				"line": "Plus de vidéos, plus de messages, plus de cartes.",
				"giphyIds": [],
				"giphyQuery": "no internet"
			},
			"b": {
				"name": "Sans téléphone",
				"origin": "La vie d’avant aussi",
				"line": "Plus d’appels, plus d’alarme, plus de photos.",
				"giphyIds": [],
				"giphyQuery": "no phone"
			}
		},
		{
			"id": "dilemmes-celebre-et-fauche-riche-et-inconnu",
			"category": "dilemmes",
			"question": "Tu préfères être célèbre et fauché, ou riche et inconnu ?",
			"a": {
				"name": "Célèbre et fauché",
				"origin": "Les tapis rouges",
				"line": "Tout le monde te connaît, personne ne te paie.",
				"giphyIds": [],
				"giphyQuery": "famous red carpet"
			},
			"b": {
				"name": "Riche et inconnu",
				"origin": "Le compte en banque",
				"line": "Personne ne te connaît, tout le monde te sert.",
				"giphyIds": [],
				"giphyQuery": "rich money"
			}
		},
		{
			"id": "dilemmes-toujours-le-meme-plat-jamais-deux-fois",
			"category": "dilemmes",
			"question": "Tu préfères manger toujours le même plat, ou jamais deux fois le même ?",
			"a": {
				"name": "Toujours le même plat",
				"origin": "Ta cuisine",
				"line": "Ton plat préféré, à chaque repas, pour toujours.",
				"giphyIds": [],
				"giphyQuery": "same food every day"
			},
			"b": {
				"name": "Jamais deux fois",
				"origin": "Ta cuisine aussi",
				"line": "Un plat différent à chaque repas, même les ratés.",
				"giphyIds": [],
				"giphyQuery": "trying new food"
			}
		},
		{
			"id": "dilemmes-toujours-dire-la-verite-ne-plus-jamais-parler",
			"category": "dilemmes",
			"question": "Tu préfères dire toujours la vérité, ou ne plus jamais parler ?",
			"a": {
				"name": "Toujours dire la vérité",
				"origin": "Ta bouche",
				"line": "Même au dîner de famille. Surtout au dîner de famille.",
				"giphyIds": [],
				"giphyQuery": "honest"
			},
			"b": {
				"name": "Ne plus jamais parler",
				"origin": "Ta bouche, fermée",
				"line": "Plus de gaffes, plus de discours.",
				"giphyIds": [],
				"giphyQuery": "silent zip mouth"
			}
		},
		{
			"id": "dilemmes-un-nez-de-clown-une-voix-d-helium",
			"category": "dilemmes",
			"question": "Tu préfères un nez de clown permanent, ou une voix d’hélium à vie ?",
			"a": {
				"name": "Un nez de clown",
				"origin": "Ton visage",
				"line": "Rouge, rond, et ça fait « pouet ».",
				"giphyIds": [],
				"giphyQuery": "clown nose"
			},
			"b": {
				"name": "Une voix d’hélium",
				"origin": "Ta gorge",
				"line": "Toutes tes phrases deviennent drôles. Même les tristes.",
				"giphyIds": [],
				"giphyQuery": "helium voice"
			}
		},
		{
			"id": "dilemmes-noir-et-blanc-en-8-bits",
			"category": "dilemmes",
			"question": "Tu préfères un monde en noir et blanc, ou un monde en 8 bits ?",
			"a": {
				"name": "Noir et blanc",
				"origin": "Le monde",
				"line": "Tout devient un vieux film.",
				"giphyIds": [],
				"giphyQuery": "black and white film"
			},
			"b": {
				"name": "En 8 bits",
				"origin": "Le monde",
				"line": "Tout devient un vieux jeu vidéo.",
				"giphyIds": [],
				"giphyQuery": "8 bit pixel"
			}
		},
		{
			"id": "dilemmes-le-genie-qu-on-ne-croit-pas-l-idiot-qu-on-croit",
			"category": "dilemmes",
			"question": "Tu préfères être un génie que personne ne croit, ou un idiot que tout le monde croit ?",
			"a": {
				"name": "Le génie qu’on ne croit pas",
				"origin": "La réunion",
				"line": "Tu as toujours raison, personne ne t’écoute.",
				"giphyIds": [],
				"giphyQuery": "ignored genius"
			},
			"b": {
				"name": "L’idiot qu’on croit",
				"origin": "La réunion aussi",
				"line": "Tu as toujours tort, tout le monde t’applaudit.",
				"giphyIds": [],
				"giphyQuery": "applause"
			}
		},
		{
			"id": "dilemmes-rougir-quand-tu-mens-eternuer-quand-tu-mens",
			"category": "dilemmes",
			"question": "Tu préfères rougir à chaque mensonge, ou éternuer à chaque mensonge ?",
			"a": {
				"name": "Rougir quand tu mens",
				"origin": "Tes joues",
				"line": "Impossible de cacher un mensonge.",
				"giphyIds": [],
				"giphyQuery": "blushing"
			},
			"b": {
				"name": "Éternuer quand tu mens",
				"origin": "Ton nez",
				"line": "Impossible de cacher un mensonge, et c’est bruyant.",
				"giphyIds": [],
				"giphyQuery": "sneezing"
			}
		},
		{
			"id": "dilemmes-une-queue-de-chat-des-oreilles-de-lapin",
			"category": "dilemmes",
			"question": "Tu préfères avoir une queue de chat, ou des oreilles de lapin ?",
			"a": {
				"name": "Une queue de chat",
				"origin": "Ton dos",
				"line": "Elle trahit toutes tes émotions.",
				"giphyIds": [],
				"giphyQuery": "cat tail"
			},
			"b": {
				"name": "Des oreilles de lapin",
				"origin": "Ta tête",
				"line": "Elles trahissent toutes tes émotions, en plus haut.",
				"giphyIds": [],
				"giphyQuery": "bunny ears"
			}
		},
		{
			"id": "dilemmes-que-du-jaune-que-des-pyjamas",
			"category": "dilemmes",
			"question": "Tu préfères ne porter que du jaune, ou que des pyjamas ?",
			"a": {
				"name": "Que du jaune",
				"origin": "Ta garde-robe",
				"line": "Tous tes vêtements, en jaune, pour toujours.",
				"giphyIds": [],
				"giphyQuery": "yellow outfit"
			},
			"b": {
				"name": "Que des pyjamas",
				"origin": "Ta garde-robe aussi",
				"line": "Confortable au mariage, moins au bureau.",
				"giphyIds": [],
				"giphyQuery": "pajamas work"
			}
		},
		{
			"id": "dilemmes-un-generique-des-rires-enregistres",
			"category": "dilemmes",
			"question": "Tu préfères un générique quand tu entres, ou des rires enregistrés quand tu parles ?",
			"a": {
				"name": "Un générique",
				"origin": "Ton entrée",
				"line": "Une musique de série quand tu entres dans une pièce.",
				"giphyIds": [],
				"giphyQuery": "entrance music"
			},
			"b": {
				"name": "Des rires enregistrés",
				"origin": "Tes phrases",
				"line": "Le public rit après chacune de tes phrases.",
				"giphyIds": [],
				"giphyQuery": "laugh track sitcom"
			}
		},
		{
			"id": "dilemmes-une-musique-de-film-un-narrateur",
			"category": "dilemmes",
			"question": "Tu préfères une musique de film qui te suit partout, ou un narrateur qui commente ta vie ?",
			"a": {
				"name": "Une musique de film",
				"origin": "Ta vie",
				"line": "Une bande-son épique, même pour sortir les poubelles.",
				"giphyIds": [],
				"giphyQuery": "epic music walking"
			},
			"b": {
				"name": "Un narrateur",
				"origin": "Ta vie",
				"line": "Une voix qui commente tout ce que tu fais.",
				"giphyIds": [],
				"giphyQuery": "narrator documentary"
			}
		},
		{
			"id": "dilemmes-tes-pensees-affichees-ton-historique-public",
			"category": "dilemmes",
			"question": "Tu préfères tes pensées affichées au-dessus de ta tête, ou ton historique Internet public ?",
			"a": {
				"name": "Tes pensées affichées",
				"origin": "Au-dessus de ta tête",
				"line": "Une bulle de bande dessinée, visible par tous.",
				"giphyIds": [],
				"giphyQuery": "thought bubble"
			},
			"b": {
				"name": "Ton historique public",
				"origin": "Internet",
				"line": "Toutes tes recherches, lisibles par tous.",
				"giphyIds": [],
				"giphyQuery": "browser history panic"
			}
		},
		{
			"id": "dilemmes-des-doigts-en-spaghettis-des-cheveux-en-spaghettis",
			"category": "dilemmes",
			"question": "Tu préfères des doigts en spaghettis, ou des cheveux en spaghettis ?",
			"a": {
				"name": "Des doigts en spaghettis",
				"origin": "Tes mains",
				"line": "Mous, longs, et très pratiques pour rien.",
				"giphyIds": [],
				"giphyQuery": "spaghetti"
			},
			"b": {
				"name": "Des cheveux en spaghettis",
				"origin": "Ta tête",
				"line": "Al dente, et parfumés à la tomate.",
				"giphyIds": [],
				"giphyQuery": "spaghetti hair"
			}
		},
		{
			"id": "dilemmes-un-canard-geant-cent-chevaux-miniatures",
			"category": "dilemmes",
			"question": "Tu préfères affronter un canard de la taille d’un cheval, ou cent chevaux de la taille d’un canard ?",
			"a": {
				"name": "Un canard géant",
				"origin": "L’arène",
				"line": "Un seul canard, de la taille d’un cheval.",
				"giphyIds": [],
				"giphyQuery": "giant duck"
			},
			"b": {
				"name": "Cent chevaux miniatures",
				"origin": "L’arène",
				"line": "Cent chevaux, de la taille d’un canard.",
				"giphyIds": [],
				"giphyQuery": "tiny horse"
			}
		},
		{
			"id": "dilemmes-plus-de-wi-fi-plus-d-eau-chaude",
			"category": "dilemmes",
			"question": "Tu préfères ne plus jamais avoir de Wi-Fi, ou ne plus jamais avoir d’eau chaude ?",
			"a": {
				"name": "Plus de Wi-Fi",
				"origin": "La maison",
				"line": "Plus jamais de connexion à la maison.",
				"giphyIds": [],
				"giphyQuery": "no wifi"
			},
			"b": {
				"name": "Plus d’eau chaude",
				"origin": "La douche",
				"line": "Plus jamais de douche chaude.",
				"giphyIds": [],
				"giphyQuery": "cold shower"
			}
		},
		{
			"id": "dilemmes-avec-ton-ex-avec-ton-patron",
			"category": "dilemmes",
			"question": "Coincé deux heures dans un ascenseur : avec ton ex, ou avec ton patron ?",
			"a": {
				"name": "Avec ton ex",
				"origin": "L’ascenseur en panne",
				"line": "Deux heures, et beaucoup de souvenirs.",
				"giphyIds": [],
				"giphyQuery": "awkward elevator"
			},
			"b": {
				"name": "Avec ton patron",
				"origin": "L’ascenseur en panne aussi",
				"line": "Deux heures, et un entretien annuel imprévu.",
				"giphyIds": [],
				"giphyQuery": "boss awkward"
			}
		},
		{
			"id": "dilemmes-du-sable-dans-les-chaussures-une-chaussette-mouillee",
			"category": "dilemmes",
			"question": "Tu préfères toujours avoir du sable dans les chaussures, ou une chaussette mouillée ?",
			"a": {
				"name": "Du sable dans les chaussures",
				"origin": "Tes pieds",
				"line": "Toujours, partout, même en hiver.",
				"giphyIds": [],
				"giphyQuery": "sand shoes"
			},
			"b": {
				"name": "Une chaussette mouillée",
				"origin": "Ton pied gauche",
				"line": "Toujours, partout, et tu ne sais jamais pourquoi.",
				"giphyIds": [],
				"giphyQuery": "wet socks"
			}
		},
		{
			"id": "dilemmes-plus-de-fromage-plus-de-chocolat",
			"category": "dilemmes",
			"question": "Tu préfères renoncer pour toujours au fromage, ou au chocolat ?",
			"a": {
				"name": "Plus de fromage",
				"origin": "Le plateau",
				"line": "Adieu raclette, adieu fondue, adieu camembert.",
				"giphyIds": [],
				"giphyQuery": "cheese"
			},
			"b": {
				"name": "Plus de chocolat",
				"origin": "La tablette",
				"line": "Adieu desserts, adieu Pâques, adieu réconfort.",
				"giphyIds": [],
				"giphyQuery": "chocolate"
			}
		},
		{
			"id": "dilemmes-batterie-a-1-ecran-fissure",
			"category": "dilemmes",
			"question": "Pour toujours : ton téléphone à 1 %, ou ton écran fissuré ?",
			"a": {
				"name": "Batterie à 1 %",
				"origin": "Ton téléphone",
				"line": "Pour toujours. Il ne s’éteint jamais, mais il te fait peur.",
				"giphyIds": [],
				"giphyQuery": "low battery"
			},
			"b": {
				"name": "Écran fissuré",
				"origin": "Ton téléphone",
				"line": "Pour toujours. Il marche, mais il pique.",
				"giphyIds": [],
				"giphyQuery": "cracked screen"
			}
		},
		{
			"id": "dilemmes-toujours-faim-toujours-sommeil",
			"category": "dilemmes",
			"question": "Tu préfères avoir toujours faim, ou toujours sommeil ?",
			"a": {
				"name": "Toujours faim",
				"origin": "Ton ventre",
				"line": "Un petit creux, en permanence.",
				"giphyIds": [],
				"giphyQuery": "hungry"
			},
			"b": {
				"name": "Toujours sommeil",
				"origin": "Tes paupières",
				"line": "Un petit coup de barre, en permanence.",
				"giphyIds": [],
				"giphyQuery": "sleepy yawn"
			}
		},
		{
			"id": "dilemmes-suivi-par-un-pigeon-suivi-par-un-mime",
			"category": "dilemmes",
			"question": "Tu préfères être suivi toute ta vie par un pigeon, ou par un mime ?",
			"a": {
				"name": "Suivi par un pigeon",
				"origin": "La rue",
				"line": "Il ne te lâche jamais, et il roucoule.",
				"giphyIds": [],
				"giphyQuery": "pigeon following"
			},
			"b": {
				"name": "Suivi par un mime",
				"origin": "La rue aussi",
				"line": "Il imite tout ce que tu fais, en silence.",
				"giphyIds": [],
				"giphyQuery": "mime"
			}
		},
		{
			"id": "dilemmes-en-rimes-en-questions",
			"category": "dilemmes",
			"question": "Tu préfères ne parler qu’en rimes, ou qu’en questions ?",
			"a": {
				"name": "En rimes",
				"origin": "Ta bouche",
				"line": "Tout ce que tu dis rime. Même tes excuses.",
				"giphyIds": [],
				"giphyQuery": "poetry"
			},
			"b": {
				"name": "En questions",
				"origin": "Ta bouche aussi",
				"line": "Tout ce que tu dis est une question. Pourquoi ?",
				"giphyIds": [],
				"giphyQuery": "confused question"
			}
		},
		{
			"id": "dilemmes-en-schtroumpf-comme-yoda",
			"category": "dilemmes",
			"question": "Tu préfères parler en schtroumpf, ou parler comme Yoda ?",
			"a": {
				"name": "En schtroumpf",
				"origin": "Ton vocabulaire",
				"line": "Tu schtroumpfes tous les mots importants.",
				"giphyIds": [],
				"giphyQuery": "Smurfs"
			},
			"b": {
				"name": "Comme Yoda",
				"origin": "Ta grammaire",
				"line": "À l’envers, tes phrases tu construis.",
				"giphyIds": [],
				"giphyQuery": "Yoda"
			}
		},
		{
			"id": "dilemmes-la-voix-de-dark-vador-la-voix-de-donald",
			"category": "dilemmes",
			"question": "Tu préfères la voix de Dark Vador, ou celle de Donald ?",
			"a": {
				"name": "La voix de Dark Vador",
				"origin": "Ta gorge",
				"line": "Une respiration lourde à chaque phrase.",
				"giphyIds": [],
				"giphyQuery": "Darth Vader breathing"
			},
			"b": {
				"name": "La voix de Donald",
				"origin": "Ta gorge aussi",
				"line": "Personne ne comprend, mais tout le monde rit.",
				"giphyIds": [],
				"giphyQuery": "Donald Duck talking"
			}
		},
		{
			"id": "dilemmes-une-comedie-musicale-un-film-d-horreur",
			"category": "dilemmes",
			"question": "Tu préfères que ta vie soit une comédie musicale, ou un film d’horreur ?",
			"a": {
				"name": "Une comédie musicale",
				"origin": "Ta vie",
				"line": "Tout le monde chante, tout le temps.",
				"giphyIds": [],
				"giphyQuery": "musical"
			},
			"b": {
				"name": "Un film d’horreur",
				"origin": "Ta vie",
				"line": "Tout le monde crie, tout le temps.",
				"giphyIds": [],
				"giphyQuery": "horror movie scream"
			}
		},
		{
			"id": "dilemmes-un-million-en-24-heures-1-000-par-mois",
			"category": "dilemmes",
			"question": "Tu préfères un million à dépenser en 24 heures, ou 1 000 € par mois à vie ?",
			"a": {
				"name": "Un million en 24 heures",
				"origin": "Ton compte en banque",
				"line": "Tout dépenser avant demain, sinon tout disparaît.",
				"giphyIds": [],
				"giphyQuery": "spending money fast"
			},
			"b": {
				"name": "1 000 € par mois",
				"origin": "Ton compte en banque",
				"line": "À vie, sans rien faire.",
				"giphyIds": [],
				"giphyQuery": "monthly paycheck"
			}
		},
		{
			"id": "dilemmes-rencontrer-ton-sosie-rencontrer-ton-toi-du-futur",
			"category": "dilemmes",
			"question": "Tu préfères rencontrer ton sosie, ou ton toi du futur ?",
			"a": {
				"name": "Rencontrer ton sosie",
				"origin": "La rue",
				"line": "Il a ta tête, mais pas ta vie.",
				"giphyIds": [],
				"giphyQuery": "doppelganger"
			},
			"b": {
				"name": "Rencontrer ton toi du futur",
				"origin": "La rue aussi",
				"line": "Il a ta tête, avec des rides et des conseils.",
				"giphyIds": [],
				"giphyQuery": "old self"
			}
		},
		{
			"id": "dilemmes-annuler-une-erreur-connaitre-une-reponse",
			"category": "dilemmes",
			"question": "Tu préfères annuler une erreur de ton passé, ou connaître une réponse sur ton futur ?",
			"a": {
				"name": "Annuler une erreur",
				"origin": "Ton passé",
				"line": "Une seule. Choisis bien.",
				"giphyIds": [],
				"giphyQuery": "undo mistake"
			},
			"b": {
				"name": "Connaître une réponse",
				"origin": "Ton futur",
				"line": "Une seule question, une seule réponse.",
				"giphyIds": [],
				"giphyQuery": "crystal ball"
			}
		},
		{
			"id": "dilemmes-des-mains-qui-collent-un-cheveu-sur-la-langue",
			"category": "dilemmes",
			"question": "Tu préfères avoir toujours les mains qui collent, ou un cheveu sur la langue ?",
			"a": {
				"name": "Des mains qui collent",
				"origin": "Tes doigts",
				"line": "Comme après une barbe à papa. Pour toujours.",
				"giphyIds": [],
				"giphyQuery": "sticky hands"
			},
			"b": {
				"name": "Un cheveu sur la langue",
				"origin": "Ta bouche",
				"line": "Tu ne le trouves jamais. Pour toujours.",
				"giphyIds": [],
				"giphyQuery": "hair on tongue"
			}
		},
		{
			"id": "dilemmes-des-films-de-3-heures-des-videos-de-30-secondes",
			"category": "dilemmes",
			"question": "Tu préfères ne regarder que des films de 3 heures, ou que des vidéos de 30 secondes ?",
			"a": {
				"name": "Des films de 3 heures",
				"origin": "Le cinéma",
				"line": "Que des épopées, pas de format court.",
				"giphyIds": [],
				"giphyQuery": "long movie"
			},
			"b": {
				"name": "Des vidéos de 30 secondes",
				"origin": "Ton téléphone",
				"line": "Que des vidéos courtes, pas de film.",
				"giphyIds": [],
				"giphyQuery": "short videos scrolling"
			}
		},
		{
			"id": "dilemmes-un-dragon-mini-un-chat-geant",
			"category": "dilemmes",
			"question": "Tu préfères un dragon de la taille d’un chat, ou un chat de la taille d’un dragon ?",
			"a": {
				"name": "Un dragon mini",
				"origin": "Ton salon",
				"line": "Un dragon de la taille d’un chat. Il crache sur le canapé.",
				"giphyIds": [],
				"giphyQuery": "tiny dragon"
			},
			"b": {
				"name": "Un chat géant",
				"origin": "Ton jardin",
				"line": "Un chat de la taille d’un dragon. Il ronronne comme un tremblement de terre.",
				"giphyIds": [],
				"giphyQuery": "giant cat"
			}
		},
		{
			"id": "dilemmes-vivre-dans-harry-potter-vivre-dans-star-wars",
			"category": "dilemmes",
			"question": "Tu préfères vivre dans le monde d’Harry Potter, ou dans celui de Star Wars ?",
			"a": {
				"name": "Vivre dans Harry Potter",
				"origin": "Poudlard",
				"line": "Des sorts, des hiboux, et des examens.",
				"giphyIds": [],
				"giphyQuery": "Hogwarts"
			},
			"b": {
				"name": "Vivre dans Star Wars",
				"origin": "Une galaxie lointaine",
				"line": "Des sabres laser, des vaisseaux, et l’Empire.",
				"giphyIds": [],
				"giphyQuery": "Star Wars lightsaber"
			}
		},
		{
			"id": "dilemmes-une-nuit-au-louvre-une-nuit-au-supermarche",
			"category": "dilemmes",
			"question": "Enfermé une nuit : au Louvre, ou dans un supermarché ?",
			"a": {
				"name": "Une nuit au Louvre",
				"origin": "Le musée",
				"line": "La Joconde, rien que pour toi.",
				"giphyIds": [],
				"giphyQuery": "Louvre night"
			},
			"b": {
				"name": "Une nuit au supermarché",
				"origin": "Le rayon gâteaux",
				"line": "Les chips, rien que pour toi.",
				"giphyIds": [],
				"giphyQuery": "supermarket night"
			}
		},
		{
			"id": "dilemmes-ton-premier-jour-d-ecole-ton-premier-rendez-vous",
			"category": "dilemmes",
			"question": "Tu préfères revivre ton premier jour d’école, ou ton premier rendez-vous amoureux ?",
			"a": {
				"name": "Ton premier jour d’école",
				"origin": "Le cartable",
				"line": "Le cartable trop grand et la peur au ventre.",
				"giphyIds": [],
				"giphyQuery": "first day of school"
			},
			"b": {
				"name": "Ton premier rendez-vous",
				"origin": "Le café",
				"line": "Les mains moites et la peur au ventre aussi.",
				"giphyIds": [],
				"giphyQuery": "first date nervous"
			}
		},
		{
			"id": "dilemmes-eternuer-en-public-le-hoquet-en-reunion",
			"category": "dilemmes",
			"question": "Tu préfères éternuer bruyamment en public, ou avoir le hoquet en réunion ?",
			"a": {
				"name": "Éternuer en public",
				"origin": "Le métro",
				"line": "Fort, et au pire moment.",
				"giphyIds": [],
				"giphyQuery": "loud sneeze"
			},
			"b": {
				"name": "Le hoquet en réunion",
				"origin": "La salle de réunion",
				"line": "Discret au début. Puis plus du tout.",
				"giphyIds": [],
				"giphyQuery": "hiccups"
			}
		},
		{
			"id": "dilemmes-un-rire-de-dauphin-un-rire-de-cochon",
			"category": "dilemmes",
			"question": "Tu préfères un rire de dauphin, ou un rire de cochon ?",
			"a": {
				"name": "Un rire de dauphin",
				"origin": "Tes éclats de rire",
				"line": "Des petits cris aigus, à chaque blague.",
				"giphyIds": [],
				"giphyQuery": "dolphin laugh"
			},
			"b": {
				"name": "Un rire de cochon",
				"origin": "Tes éclats de rire aussi",
				"line": "Des grognements, à chaque blague.",
				"giphyIds": [],
				"giphyQuery": "pig snort laugh"
			}
		},
		{
			"id": "dilemmes-toujours-debout-toujours-assis",
			"category": "dilemmes",
			"question": "Tu préfères ne plus jamais pouvoir t’asseoir, ou ne plus jamais pouvoir te lever ?",
			"a": {
				"name": "Toujours debout",
				"origin": "Tes jambes",
				"line": "Plus jamais de chaise, de canapé, de siège.",
				"giphyIds": [],
				"giphyQuery": "standing"
			},
			"b": {
				"name": "Toujours assis",
				"origin": "Ton fauteuil",
				"line": "Plus jamais debout. Tu te déplaces en chaise de bureau.",
				"giphyIds": [],
				"giphyQuery": "office chair rolling"
			}
		},
		{
			"id": "dilemmes-la-vie-de-ton-chat-la-vie-de-ton-poisson-rouge",
			"category": "dilemmes",
			"question": "Tu préfères vivre la vie de ton chat, ou celle de ton poisson rouge ?",
			"a": {
				"name": "La vie de ton chat",
				"origin": "Le canapé",
				"line": "Seize heures de sieste et des croquettes.",
				"giphyIds": [],
				"giphyQuery": "cat sleeping"
			},
			"b": {
				"name": "La vie de ton poisson rouge",
				"origin": "Le bocal",
				"line": "Des tours de bocal, et zéro souvenir.",
				"giphyIds": [],
				"giphyQuery": "goldfish"
			}
		},
		{
			"id": "dilemmes-retrouver-tes-10-ans-sauter-a-tes-80-ans",
			"category": "dilemmes",
			"question": "Tu préfères revenir à tes 10 ans, ou sauter directement à tes 80 ans ?",
			"a": {
				"name": "Retrouver tes 10 ans",
				"origin": "Le passé",
				"line": "Avec tout ce que tu sais aujourd’hui.",
				"giphyIds": [],
				"giphyQuery": "kid again"
			},
			"b": {
				"name": "Sauter à tes 80 ans",
				"origin": "Le futur",
				"line": "Avec tout ce que tu sais aujourd’hui aussi.",
				"giphyIds": [],
				"giphyQuery": "old person"
			}
		},
		{
			"id": "dilemmes-jamais-non-jamais-oui",
			"category": "dilemmes",
			"question": "Tu préfères ne plus jamais pouvoir dire non, ou ne plus jamais pouvoir dire oui ?",
			"a": {
				"name": "Jamais « non »",
				"origin": "Ta bouche",
				"line": "Tu acceptes tout. Absolument tout.",
				"giphyIds": [],
				"giphyQuery": "yes man"
			},
			"b": {
				"name": "Jamais « oui »",
				"origin": "Ta bouche aussi",
				"line": "Tu refuses tout. Même les desserts.",
				"giphyIds": [],
				"giphyQuery": "no no no"
			}
		},
		{
			"id": "dilemmes-cereales-infinies-chocolat-qui-repousse",
			"category": "dilemmes",
			"question": "Tu préfères une boîte de céréales infinie, ou une tablette de chocolat qui se reconstitue ?",
			"a": {
				"name": "Céréales infinies",
				"origin": "Le placard",
				"line": "Une boîte qui ne se vide jamais.",
				"giphyIds": [],
				"giphyQuery": "cereal bowl"
			},
			"b": {
				"name": "Chocolat qui repousse",
				"origin": "Le placard aussi",
				"line": "Une tablette qui se reconstitue toute seule.",
				"giphyIds": [],
				"giphyQuery": "chocolate bar"
			}
		},
		{
			"id": "pouvoirs-voler-etre-invisible",
			"category": "pouvoirs",
			"a": {
				"name": "Voler",
				"origin": "Le ciel",
				"line": "Plus de bouchons, mais des moustiques dans les dents.",
				"giphyIds": [],
				"giphyQuery": "flying superhero"
			},
			"b": {
				"name": "Être invisible",
				"origin": "Partout",
				"line": "Personne ne te voit. Même quand tu as besoin d’aide.",
				"giphyIds": [],
				"giphyQuery": "invisible"
			}
		},
		{
			"id": "pouvoirs-lire-dans-les-pensees-voir-l-avenir",
			"category": "pouvoirs",
			"a": {
				"name": "Lire dans les pensées",
				"origin": "Les autres",
				"line": "Tu sais tout. Même ce que tu n’aurais pas voulu savoir.",
				"giphyIds": [],
				"giphyQuery": "mind reading"
			},
			"b": {
				"name": "Voir l’avenir",
				"origin": "Demain",
				"line": "Tu sais tout ce qui va arriver. Plus aucune surprise.",
				"giphyIds": [],
				"giphyQuery": "crystal ball future"
			}
		},
		{
			"id": "pouvoirs-se-teleporter-arreter-le-temps",
			"category": "pouvoirs",
			"a": {
				"name": "Se téléporter",
				"origin": "N’importe où",
				"line": "Paris-Tokyo en une seconde. Adieu les avions.",
				"giphyIds": [],
				"giphyQuery": "teleport"
			},
			"b": {
				"name": "Arrêter le temps",
				"origin": "N’importe quand",
				"line": "Tout s’arrête, sauf toi. La sieste éternelle.",
				"giphyIds": [],
				"giphyQuery": "time freeze"
			}
		},
		{
			"id": "pouvoirs-super-force-super-vitesse",
			"category": "pouvoirs",
			"a": {
				"name": "Super-force",
				"origin": "Tes bras",
				"line": "Soulever une voiture, ouvrir tous les bocaux.",
				"giphyIds": [],
				"giphyQuery": "super strength"
			},
			"b": {
				"name": "Super-vitesse",
				"origin": "Tes jambes",
				"line": "Arriver avant même d’être parti.",
				"giphyIds": [],
				"giphyQuery": "super speed"
			}
		},
		{
			"id": "pouvoirs-respirer-sous-l-eau-ne-jamais-avoir-froid",
			"category": "pouvoirs",
			"a": {
				"name": "Respirer sous l’eau",
				"origin": "L’océan",
				"line": "Explorer les fonds marins, sans bouteille.",
				"giphyIds": [],
				"giphyQuery": "breathing underwater"
			},
			"b": {
				"name": "Ne jamais avoir froid",
				"origin": "La banquise",
				"line": "Le pôle Nord en t-shirt.",
				"giphyIds": [],
				"giphyQuery": "snow t-shirt"
			}
		},
		{
			"id": "pouvoirs-parler-aux-animaux-parler-toutes-les-langues",
			"category": "pouvoirs",
			"a": {
				"name": "Parler aux animaux",
				"origin": "La nature",
				"line": "Enfin savoir ce que pense ton chat.",
				"giphyIds": [],
				"giphyQuery": "talking to animals"
			},
			"b": {
				"name": "Parler toutes les langues",
				"origin": "Le monde",
				"line": "Enfin comprendre ce que disent les touristes.",
				"giphyIds": [],
				"giphyQuery": "translator languages"
			}
		},
		{
			"id": "pouvoirs-guerir-les-autres-ne-jamais-tomber-malade",
			"category": "pouvoirs",
			"a": {
				"name": "Guérir les autres",
				"origin": "Tes mains",
				"line": "Un rhume, une fracture, un cœur brisé.",
				"giphyIds": [],
				"giphyQuery": "healing hands"
			},
			"b": {
				"name": "Ne jamais tomber malade",
				"origin": "Ton corps",
				"line": "Plus jamais de rhume, plus jamais de vaccin raté.",
				"giphyIds": [],
				"giphyQuery": "healthy strong"
			}
		},
		{
			"id": "pouvoirs-controler-la-meteo-controler-les-feux-rouges",
			"category": "pouvoirs",
			"a": {
				"name": "Contrôler la météo",
				"origin": "Le ciel",
				"line": "Du soleil pour tes vacances, de la neige pour Noël.",
				"giphyIds": [],
				"giphyQuery": "weather control"
			},
			"b": {
				"name": "Contrôler les feux rouges",
				"origin": "La ville",
				"line": "Vert, à chaque fois, partout.",
				"giphyIds": [],
				"giphyQuery": "green traffic light"
			}
		},
		{
			"id": "pouvoirs-voyager-dans-le-passe-voyager-dans-le-futur",
			"category": "pouvoirs",
			"a": {
				"name": "Voyager dans le passé",
				"origin": "Hier, et avant",
				"line": "Voir les dinosaures, et éviter tes erreurs.",
				"giphyIds": [],
				"giphyQuery": "time travel past"
			},
			"b": {
				"name": "Voyager dans le futur",
				"origin": "Demain, et après",
				"line": "Voir les voitures volantes, et les résultats du loto.",
				"giphyIds": [],
				"giphyQuery": "futuristic city"
			}
		},
		{
			"id": "pouvoirs-copier-les-pouvoirs-effacer-les-pouvoirs",
			"category": "pouvoirs",
			"a": {
				"name": "Copier les pouvoirs",
				"origin": "Les autres héros",
				"line": "Tous les pouvoirs, à condition de les toucher.",
				"giphyIds": [],
				"giphyQuery": "copy powers"
			},
			"b": {
				"name": "Effacer les pouvoirs",
				"origin": "Les autres héros",
				"line": "Plus personne n’a de pouvoir. Sauf toi.",
				"giphyIds": [],
				"giphyQuery": "power absorb"
			}
		},
		{
			"id": "pouvoirs-retrecir-grandir",
			"category": "pouvoirs",
			"a": {
				"name": "Rétrécir",
				"origin": "La taille d’une fourmi",
				"line": "Passer sous les portes, et rester en vie.",
				"giphyIds": [],
				"giphyQuery": "Ant-Man"
			},
			"b": {
				"name": "Grandir",
				"origin": "La taille d’un immeuble",
				"line": "Voir par-dessus les foules, et les toits.",
				"giphyIds": [],
				"giphyQuery": "giant"
			}
		},
		{
			"id": "pouvoirs-changer-d-apparence-changer-de-voix",
			"category": "pouvoirs",
			"a": {
				"name": "Changer d’apparence",
				"origin": "Ton visage",
				"line": "Devenir n’importe qui, en un instant.",
				"giphyIds": [],
				"giphyQuery": "shapeshifter"
			},
			"b": {
				"name": "Changer de voix",
				"origin": "Ta gorge",
				"line": "Imiter n’importe qui, à la perfection.",
				"giphyIds": [],
				"giphyQuery": "voice impression"
			}
		},
		{
			"id": "pouvoirs-telekinesie-controler-le-feu",
			"category": "pouvoirs",
			"a": {
				"name": "Télékinésie",
				"origin": "Ton esprit",
				"line": "Déplacer les objets par la pensée. La télécommande vient toute seule.",
				"giphyIds": [],
				"giphyQuery": "telekinesis"
			},
			"b": {
				"name": "Contrôler le feu",
				"origin": "Tes mains",
				"line": "Allumer le barbecue d’un regard.",
				"giphyIds": [],
				"giphyQuery": "fire powers"
			}
		},
		{
			"id": "pouvoirs-maitriser-l-eau-maitriser-l-air",
			"category": "pouvoirs",
			"a": {
				"name": "Maîtriser l’eau",
				"origin": "Les océans",
				"line": "Faire des vagues, littéralement.",
				"giphyIds": [],
				"giphyQuery": "water bending"
			},
			"b": {
				"name": "Maîtriser l’air",
				"origin": "Le vent",
				"line": "Sécher tes cheveux, et voler les chapeaux.",
				"giphyIds": [],
				"giphyQuery": "air bending"
			}
		},
		{
			"id": "pouvoirs-vision-laser-vision-a-rayons-x",
			"category": "pouvoirs",
			"a": {
				"name": "Vision laser",
				"origin": "Tes yeux",
				"line": "Découper n’importe quoi, d’un regard.",
				"giphyIds": [],
				"giphyQuery": "laser eyes"
			},
			"b": {
				"name": "Vision à rayons X",
				"origin": "Tes yeux aussi",
				"line": "Voir à travers les murs, et dans les cadeaux de Noël.",
				"giphyIds": [],
				"giphyQuery": "x-ray vision"
			}
		},
		{
			"id": "pouvoirs-super-ouie-super-odorat",
			"category": "pouvoirs",
			"a": {
				"name": "Super-ouïe",
				"origin": "Tes oreilles",
				"line": "Entendre tous les secrets, même au fond de la salle.",
				"giphyIds": [],
				"giphyQuery": "super hearing"
			},
			"b": {
				"name": "Super-odorat",
				"origin": "Ton nez",
				"line": "Sentir les croissants à trois kilomètres.",
				"giphyIds": [],
				"giphyQuery": "smelling"
			}
		},
		{
			"id": "pouvoirs-memoire-photographique-apprendre-en-une-nuit",
			"category": "pouvoirs",
			"a": {
				"name": "Mémoire photographique",
				"origin": "Ton cerveau",
				"line": "Tu te souviens de tout. Même de ce que tu voudrais oublier.",
				"giphyIds": [],
				"giphyQuery": "photographic memory"
			},
			"b": {
				"name": "Apprendre en une nuit",
				"origin": "Ton oreiller",
				"line": "Un livre sous l’oreiller, et tu le sais par cœur.",
				"giphyIds": [],
				"giphyQuery": "learning fast"
			}
		},
		{
			"id": "pouvoirs-ne-jamais-vieillir-guerir-de-tout",
			"category": "pouvoirs",
			"a": {
				"name": "Ne jamais vieillir",
				"origin": "Le temps",
				"line": "Toujours le même âge, toujours la même tête.",
				"giphyIds": [],
				"giphyQuery": "forever young"
			},
			"b": {
				"name": "Guérir de tout",
				"origin": "Ton corps",
				"line": "Toutes les blessures disparaissent en une seconde.",
				"giphyIds": [],
				"giphyQuery": "Wolverine healing"
			}
		},
		{
			"id": "pouvoirs-parler-aux-plantes-faire-pousser-n-importe-quoi",
			"category": "pouvoirs",
			"a": {
				"name": "Parler aux plantes",
				"origin": "Ton jardin",
				"line": "Enfin savoir pourquoi ton cactus déprime.",
				"giphyIds": [],
				"giphyQuery": "talking to plants"
			},
			"b": {
				"name": "Faire pousser n’importe quoi",
				"origin": "Ta main verte",
				"line": "Une forêt en dix minutes.",
				"giphyIds": [],
				"giphyQuery": "growing plants fast"
			}
		},
		{
			"id": "pouvoirs-une-place-de-parking-la-caisse-la-plus-rapide",
			"category": "pouvoirs",
			"a": {
				"name": "Une place de parking",
				"origin": "Partout",
				"line": "Toujours libre, toujours devant la porte.",
				"giphyIds": [],
				"giphyQuery": "parking spot"
			},
			"b": {
				"name": "La caisse la plus rapide",
				"origin": "Le supermarché",
				"line": "Toujours la bonne file, toujours la première.",
				"giphyIds": [],
				"giphyQuery": "supermarket checkout"
			}
		},
		{
			"id": "pouvoirs-ne-jamais-perdre-tes-cles-ne-jamais-oublier-un-nom",
			"category": "pouvoirs",
			"a": {
				"name": "Ne jamais perdre tes clés",
				"origin": "Ta poche",
				"line": "Elles sont toujours là où tu les cherches.",
				"giphyIds": [],
				"giphyQuery": "keys"
			},
			"b": {
				"name": "Ne jamais oublier un nom",
				"origin": "Ta mémoire",
				"line": "Plus jamais de « euh… toi ! ».",
				"giphyIds": [],
				"giphyQuery": "name tag"
			}
		},
		{
			"id": "pouvoirs-recharger-ton-telephone-du-wi-fi-partout",
			"category": "pouvoirs",
			"a": {
				"name": "Recharger ton téléphone",
				"origin": "Ta main",
				"line": "Une pression du doigt, et 100 %.",
				"giphyIds": [],
				"giphyQuery": "phone charging"
			},
			"b": {
				"name": "Du Wi-Fi partout",
				"origin": "Toi",
				"line": "Tu es un routeur ambulant.",
				"giphyIds": [],
				"giphyQuery": "wifi"
			}
		},
		{
			"id": "pouvoirs-grimper-aux-murs-respirer-dans-l-espace",
			"category": "pouvoirs",
			"a": {
				"name": "Grimper aux murs",
				"origin": "Les immeubles",
				"line": "Comme une araignée, sans les huit pattes.",
				"giphyIds": [],
				"giphyQuery": "Spider-Man climbing"
			},
			"b": {
				"name": "Respirer dans l’espace",
				"origin": "La Lune",
				"line": "Une balade sans combinaison.",
				"giphyIds": [],
				"giphyQuery": "astronaut space"
			}
		},
		{
			"id": "pouvoirs-traverser-les-murs-marcher-sur-l-eau",
			"category": "pouvoirs",
			"a": {
				"name": "Traverser les murs",
				"origin": "Les murs",
				"line": "Plus besoin de clés, plus besoin de portes.",
				"giphyIds": [],
				"giphyQuery": "walking through walls"
			},
			"b": {
				"name": "Marcher sur l’eau",
				"origin": "Le lac",
				"line": "Traverser la rivière sans se mouiller.",
				"giphyIds": [],
				"giphyQuery": "walking on water"
			}
		},
		{
			"id": "pouvoirs-cri-supersonique-regard-petrifiant",
			"category": "pouvoirs",
			"a": {
				"name": "Cri supersonique",
				"origin": "Ta voix",
				"line": "Un cri, et toutes les vitres tremblent.",
				"giphyIds": [],
				"giphyQuery": "sonic scream"
			},
			"b": {
				"name": "Regard pétrifiant",
				"origin": "Tes yeux",
				"line": "Un regard, et plus personne ne bouge.",
				"giphyIds": [],
				"giphyQuery": "Medusa stare"
			}
		},
		{
			"id": "pouvoirs-commander-aux-insectes-commander-aux-oiseaux",
			"category": "pouvoirs",
			"a": {
				"name": "Commander aux insectes",
				"origin": "Les fourmis",
				"line": "Une armée de fourmis à tes ordres.",
				"giphyIds": [],
				"giphyQuery": "ant army"
			},
			"b": {
				"name": "Commander aux oiseaux",
				"origin": "Les pigeons",
				"line": "Une escadrille de pigeons à tes ordres.",
				"giphyIds": [],
				"giphyQuery": "flock of birds"
			}
		},
		{
			"id": "pouvoirs-controler-l-electricite-controler-le-metal",
			"category": "pouvoirs",
			"a": {
				"name": "Contrôler l’électricité",
				"origin": "Les éclairs",
				"line": "Recharger la ville, ou tout faire sauter.",
				"giphyIds": [],
				"giphyQuery": "electricity powers"
			},
			"b": {
				"name": "Contrôler le métal",
				"origin": "Le magnétisme",
				"line": "Plier les voitures, et retrouver tes clés.",
				"giphyIds": [],
				"giphyQuery": "Magneto"
			}
		},
		{
			"id": "pouvoirs-se-dupliquer-quatre-bras",
			"category": "pouvoirs",
			"a": {
				"name": "Se dupliquer",
				"origin": "Toi, en double",
				"line": "Un toi au travail, un toi à la sieste.",
				"giphyIds": [],
				"giphyQuery": "clones"
			},
			"b": {
				"name": "Quatre bras",
				"origin": "Ton torse",
				"line": "Tout faire en même temps, et bien.",
				"giphyIds": [],
				"giphyQuery": "four arms"
			}
		},
		{
			"id": "pouvoirs-le-sens-de-l-orientation-toujours-savoir-quoi-dire",
			"category": "pouvoirs",
			"question": "Tu préfères ne jamais te perdre, ou toujours savoir quoi dire ?",
			"a": {
				"name": "Le sens de l’orientation",
				"origin": "Ton GPS intérieur",
				"line": "Ne jamais te perdre, nulle part.",
				"giphyIds": [],
				"giphyQuery": "compass"
			},
			"b": {
				"name": "Toujours savoir quoi dire",
				"origin": "Ta répartie",
				"line": "La bonne réplique, au bon moment.",
				"giphyIds": [],
				"giphyQuery": "mic drop"
			}
		},
		{
			"id": "pouvoirs-rembobiner-dix-secondes-mettre-pause-une-minute",
			"category": "pouvoirs",
			"a": {
				"name": "Rembobiner dix secondes",
				"origin": "Ta montre",
				"line": "Dire autre chose, refaire le geste raté.",
				"giphyIds": [],
				"giphyQuery": "rewind"
			},
			"b": {
				"name": "Mettre pause une minute",
				"origin": "Ta montre aussi",
				"line": "Le temps de trouver la réplique parfaite.",
				"giphyIds": [],
				"giphyQuery": "pause time"
			}
		},
		{
			"id": "pouvoirs-voir-dans-le-noir-voir-a-des-kilometres",
			"category": "pouvoirs",
			"a": {
				"name": "Voir dans le noir",
				"origin": "Tes yeux, la nuit",
				"line": "Plus jamais de petit orteil contre le meuble.",
				"giphyIds": [],
				"giphyQuery": "night vision"
			},
			"b": {
				"name": "Voir à des kilomètres",
				"origin": "Tes yeux, le jour",
				"line": "Lire le panneau de l’autoroute depuis la maison.",
				"giphyIds": [],
				"giphyQuery": "binoculars"
			}
		},
		{
			"id": "pouvoirs-lancer-des-toiles-lancer-des-eclairs",
			"category": "pouvoirs",
			"a": {
				"name": "Lancer des toiles",
				"origin": "Tes poignets",
				"line": "Se balancer entre les immeubles.",
				"giphyIds": [],
				"giphyQuery": "web shooting"
			},
			"b": {
				"name": "Lancer des éclairs",
				"origin": "Tes mains",
				"line": "Un orage personnel, sur commande.",
				"giphyIds": [],
				"giphyQuery": "lightning hands"
			}
		},
		{
			"id": "pouvoirs-invoquer-n-importe-quel-plat-invoquer-n-importe-quelle-boisso",
			"category": "pouvoirs",
			"a": {
				"name": "Invoquer n’importe quel plat",
				"origin": "Ta table",
				"line": "Une raclette, en été, en deux secondes.",
				"giphyIds": [],
				"giphyQuery": "food appearing"
			},
			"b": {
				"name": "Invoquer n’importe quelle boisson",
				"origin": "Ton verre",
				"line": "Un chocolat chaud, en randonnée, en deux secondes.",
				"giphyIds": [],
				"giphyQuery": "drink appearing"
			}
		},
		{
			"id": "pouvoirs-chance-aux-jeux-gagner-tous-les-debats",
			"category": "pouvoirs",
			"a": {
				"name": "Chance aux jeux",
				"origin": "Le loto",
				"line": "Gagner à tous les jeux de hasard.",
				"giphyIds": [],
				"giphyQuery": "winning lottery"
			},
			"b": {
				"name": "Gagner tous les débats",
				"origin": "Le repas de famille",
				"line": "Avoir toujours raison, et que tout le monde le reconnaisse.",
				"giphyIds": [],
				"giphyQuery": "winning argument"
			}
		},
		{
			"id": "pouvoirs-se-transformer-en-animal-se-transformer-en-objet",
			"category": "pouvoirs",
			"a": {
				"name": "Se transformer en animal",
				"origin": "La forêt",
				"line": "Devenir loup, aigle, ou chat de canapé.",
				"giphyIds": [],
				"giphyQuery": "animal transformation"
			},
			"b": {
				"name": "Se transformer en objet",
				"origin": "Le salon",
				"line": "Devenir lampe, chaise, ou grille-pain. Discret.",
				"giphyIds": [],
				"giphyQuery": "object transformation"
			}
		},
		{
			"id": "pouvoirs-super-elasticite-peau-d-acier",
			"category": "pouvoirs",
			"a": {
				"name": "Super-élasticité",
				"origin": "Ton corps",
				"line": "S’étirer, s’enrouler, passer partout.",
				"giphyIds": [],
				"giphyQuery": "elastic powers"
			},
			"b": {
				"name": "Peau d’acier",
				"origin": "Ton corps aussi",
				"line": "Rien ne te blesse. Même pas les pièces de Lego.",
				"giphyIds": [],
				"giphyQuery": "steel skin"
			}
		},
		{
			"id": "pouvoirs-controler-les-reves-effacer-les-mauvais-souvenirs",
			"category": "pouvoirs",
			"a": {
				"name": "Contrôler les rêves",
				"origin": "Tes nuits",
				"line": "Des rêves sur mesure, chaque nuit.",
				"giphyIds": [],
				"giphyQuery": "dreaming"
			},
			"b": {
				"name": "Effacer les mauvais souvenirs",
				"origin": "Ta mémoire",
				"line": "Le pire moment de ta vie, supprimé.",
				"giphyIds": [],
				"giphyQuery": "memory erase"
			}
		},
		{
			"id": "pouvoirs-creer-des-illusions-detecter-les-mensonges",
			"category": "pouvoirs",
			"a": {
				"name": "Créer des illusions",
				"origin": "Les yeux des autres",
				"line": "Faire voir n’importe quoi à n’importe qui.",
				"giphyIds": [],
				"giphyQuery": "illusion magic"
			},
			"b": {
				"name": "Détecter les mensonges",
				"origin": "Tes oreilles",
				"line": "Personne ne peut plus te mentir.",
				"giphyIds": [],
				"giphyQuery": "lie detector"
			}
		},
		{
			"id": "pouvoirs-souffle-de-dragon-toucher-glace",
			"category": "pouvoirs",
			"a": {
				"name": "Souffle de dragon",
				"origin": "Ta bouche",
				"line": "Du feu, quand tu veux. Attention aux bougies.",
				"giphyIds": [],
				"giphyQuery": "fire breathing"
			},
			"b": {
				"name": "Toucher glacé",
				"origin": "Tes mains",
				"line": "Tout ce que tu touches gèle. Pratique pour les boissons.",
				"giphyIds": [],
				"giphyQuery": "ice powers"
			}
		},
		{
			"id": "pouvoirs-voler-avec-une-cape-voler-avec-des-reacteurs",
			"category": "pouvoirs",
			"a": {
				"name": "Voler avec une cape",
				"origin": "Le ciel",
				"line": "Comme Superman, les bras en avant.",
				"giphyIds": [],
				"giphyQuery": "Superman flying"
			},
			"b": {
				"name": "Voler avec des réacteurs",
				"origin": "Le ciel aussi",
				"line": "Comme Iron Man, avec du bruit.",
				"giphyIds": [],
				"giphyQuery": "Iron Man flying"
			}
		},
		{
			"id": "pouvoirs-parler-aux-fantomes-parler-aux-extraterrestres",
			"category": "pouvoirs",
			"a": {
				"name": "Parler aux fantômes",
				"origin": "L’au-delà",
				"line": "Des conversations très, très anciennes.",
				"giphyIds": [],
				"giphyQuery": "ghosts"
			},
			"b": {
				"name": "Parler aux extraterrestres",
				"origin": "L’espace",
				"line": "Des conversations très, très lointaines.",
				"giphyIds": [],
				"giphyQuery": "alien talking"
			}
		},
		{
			"id": "pouvoirs-ralentir-le-temps-accelerer-le-temps",
			"category": "pouvoirs",
			"a": {
				"name": "Ralentir le temps",
				"origin": "Les balles",
				"line": "Le monde au ralenti, comme dans Matrix.",
				"giphyIds": [],
				"giphyQuery": "bullet time"
			},
			"b": {
				"name": "Accélérer le temps",
				"origin": "Les files d’attente",
				"line": "Les réunions passent en dix secondes.",
				"giphyIds": [],
				"giphyQuery": "fast forward"
			}
		},
		{
			"id": "pouvoirs-comprendre-les-bebes-comprendre-les-chats",
			"category": "pouvoirs",
			"a": {
				"name": "Comprendre les bébés",
				"origin": "La crèche",
				"line": "Enfin savoir pourquoi il pleure.",
				"giphyIds": [],
				"giphyQuery": "baby crying"
			},
			"b": {
				"name": "Comprendre les chats",
				"origin": "Le canapé",
				"line": "Enfin savoir pourquoi il renverse ton verre.",
				"giphyIds": [],
				"giphyQuery": "cat pushing glass"
			}
		},
		{
			"id": "pouvoirs-ouvrir-toutes-les-portes-ouvrir-tous-les-bocaux",
			"category": "pouvoirs",
			"a": {
				"name": "Ouvrir toutes les portes",
				"origin": "Les serrures",
				"line": "Plus besoin de clés, nulle part.",
				"giphyIds": [],
				"giphyQuery": "unlocking door"
			},
			"b": {
				"name": "Ouvrir tous les bocaux",
				"origin": "La cuisine",
				"line": "Plus besoin d’appeler à l’aide.",
				"giphyIds": [],
				"giphyQuery": "opening jar"
			}
		},
		{
			"id": "pouvoirs-ne-jamais-transpirer-ne-jamais-rougir",
			"category": "pouvoirs",
			"question": "Tu préfères ne jamais transpirer, ou ne jamais rougir ?",
			"a": {
				"name": "Ne jamais transpirer",
				"origin": "Ton corps",
				"line": "Même en plein été, même au sport.",
				"giphyIds": [],
				"giphyQuery": "dry"
			},
			"b": {
				"name": "Ne jamais rougir",
				"origin": "Tes joues",
				"line": "Même quand on te fait un compliment.",
				"giphyIds": [],
				"giphyQuery": "poker face"
			}
		},
		{
			"id": "pouvoirs-les-pouvoirs-de-superman-les-pouvoirs-de-batman",
			"category": "pouvoirs",
			"a": {
				"name": "Les pouvoirs de Superman",
				"origin": "Krypton",
				"line": "Voler, la force, les yeux laser.",
				"giphyIds": [],
				"giphyQuery": "Superman"
			},
			"b": {
				"name": "Les pouvoirs de Batman",
				"origin": "Wayne Enterprises",
				"line": "Beaucoup d’argent, et des gadgets.",
				"giphyIds": [],
				"giphyQuery": "Batman gadgets"
			}
		},
		{
			"id": "pouvoirs-la-force-de-hulk-le-cerveau-de-tony-stark",
			"category": "pouvoirs",
			"a": {
				"name": "La force de Hulk",
				"origin": "Tes muscles",
				"line": "Tout casser, mais en vert.",
				"giphyIds": [],
				"giphyQuery": "Hulk smash"
			},
			"b": {
				"name": "Le cerveau de Tony Stark",
				"origin": "Ton crâne",
				"line": "Tout inventer, mais pas l’humilité.",
				"giphyIds": [],
				"giphyQuery": "Tony Stark genius"
			}
		},
		{
			"id": "pouvoirs-une-baguette-magique-une-lampe-a-genie",
			"category": "pouvoirs",
			"a": {
				"name": "Une baguette magique",
				"origin": "Poudlard",
				"line": "Tous les sorts, à condition de bien prononcer.",
				"giphyIds": [],
				"giphyQuery": "magic wand"
			},
			"b": {
				"name": "Une lampe à génie",
				"origin": "Agrabah",
				"line": "Trois vœux, et pas un de plus.",
				"giphyIds": [],
				"giphyQuery": "genie lamp"
			}
		},
		{
			"id": "pouvoirs-voler-lentement-courir-vite-a-reculons",
			"category": "pouvoirs",
			"question": "Tu préfères voler, mais très lentement, ou courir très vite, mais seulement à reculons ?",
			"a": {
				"name": "Voler lentement",
				"origin": "Le ciel",
				"line": "Tu peux voler, mais à quatre kilomètres-heure.",
				"giphyIds": [],
				"giphyQuery": "slow flying"
			},
			"b": {
				"name": "Courir vite à reculons",
				"origin": "Le trottoir",
				"line": "Tu cours à cent kilomètres-heure, mais seulement en arrière.",
				"giphyIds": [],
				"giphyQuery": "running backwards"
			}
		},
		{
			"id": "pouvoirs-invisible-si-personne-ne-regarde-lire-les-pensees-des-pigeons",
			"category": "pouvoirs",
			"question": "Tu préfères être invisible seulement quand personne ne regarde, ou lire dans les pensées des pigeons ?",
			"a": {
				"name": "Invisible si personne ne regarde",
				"origin": "Le néant",
				"line": "Invisible, à condition que personne ne te regarde.",
				"giphyIds": [],
				"giphyQuery": "invisible joke"
			},
			"b": {
				"name": "Lire les pensées des pigeons",
				"origin": "Le parc",
				"line": "Tu entends tout ce que pensent les pigeons. C’est surtout « miettes ».",
				"giphyIds": [],
				"giphyQuery": "pigeon thinking"
			}
		},
		{
			"id": "monstres-vampires-loups-garous",
			"category": "monstres",
			"a": {
				"name": "Vampires",
				"origin": "Transylvanie",
				"line": "Des capes, des crocs, et une allergie à l’ail.",
				"giphyIds": [],
				"giphyQuery": "vampire"
			},
			"b": {
				"name": "Loups-garous",
				"origin": "La pleine lune",
				"line": "Des poils, des griffes, et des nuits agitées.",
				"giphyIds": [],
				"giphyQuery": "werewolf"
			}
		},
		{
			"id": "monstres-zombies-aliens",
			"category": "monstres",
			"a": {
				"name": "Zombies",
				"origin": "L’apocalypse",
				"line": "Lents, nombreux, et toujours affamés.",
				"giphyIds": [],
				"giphyQuery": "zombies"
			},
			"b": {
				"name": "Aliens",
				"origin": "L’espace",
				"line": "Grands yeux, soucoupes, et sondes.",
				"giphyIds": [],
				"giphyQuery": "aliens ufo"
			}
		},
		{
			"id": "monstres-godzilla-king-kong",
			"category": "monstres",
			"a": {
				"name": "Godzilla",
				"origin": "Tokyo · 1954",
				"line": "Un lézard géant qui détruit des villes.",
				"giphyIds": [],
				"giphyQuery": "Godzilla"
			},
			"b": {
				"name": "King Kong",
				"origin": "Skull Island · 1933",
				"line": "Un gorille géant qui escalade des gratte-ciel.",
				"giphyIds": [],
				"giphyQuery": "King Kong"
			}
		},
		{
			"id": "monstres-dragon-licorne",
			"category": "monstres",
			"a": {
				"name": "Dragon",
				"origin": "Les légendes",
				"line": "Des écailles, des ailes, et un trésor.",
				"giphyIds": [],
				"giphyQuery": "dragon"
			},
			"b": {
				"name": "Licorne",
				"origin": "Les légendes aussi",
				"line": "Une corne, des paillettes, et un arc-en-ciel.",
				"giphyIds": [],
				"giphyQuery": "unicorn"
			}
		},
		{
			"id": "monstres-fantome-esprit-frappeur",
			"category": "monstres",
			"a": {
				"name": "Fantôme",
				"origin": "Le grenier",
				"line": "Un drap blanc, et des chaînes qui grincent.",
				"giphyIds": [],
				"giphyQuery": "ghost sheet"
			},
			"b": {
				"name": "Esprit frappeur",
				"origin": "La cuisine",
				"line": "Il fait voler les assiettes.",
				"giphyIds": [],
				"giphyQuery": "poltergeist"
			}
		},
		{
			"id": "monstres-la-creature-de-frankenstein-dracula",
			"category": "monstres",
			"a": {
				"name": "La créature de Frankenstein",
				"origin": "Mary Shelley · 1818",
				"line": "Des boulons dans le cou, et un grand cœur.",
				"giphyIds": [],
				"giphyQuery": "Frankenstein monster"
			},
			"b": {
				"name": "Dracula",
				"origin": "Bram Stoker · 1897",
				"line": "Un château, un cercueil, et beaucoup de classe.",
				"giphyIds": [],
				"giphyQuery": "Dracula"
			}
		},
		{
			"id": "monstres-le-kraken-le-monstre-du-loch-ness",
			"category": "monstres",
			"a": {
				"name": "Le Kraken",
				"origin": "Les mers du Nord",
				"line": "Des tentacules gigantesques, et des navires engloutis.",
				"giphyIds": [],
				"giphyQuery": "Kraken"
			},
			"b": {
				"name": "Le monstre du loch Ness",
				"origin": "L’Écosse",
				"line": "Toujours flou sur les photos.",
				"giphyIds": [],
				"giphyQuery": "Loch Ness monster"
			}
		},
		{
			"id": "monstres-yeti-bigfoot",
			"category": "monstres",
			"a": {
				"name": "Yéti",
				"origin": "L’Himalaya",
				"line": "Une grande empreinte dans la neige.",
				"giphyIds": [],
				"giphyQuery": "Yeti"
			},
			"b": {
				"name": "Bigfoot",
				"origin": "Les forêts américaines",
				"line": "Une silhouette floue dans les bois.",
				"giphyIds": [],
				"giphyQuery": "Bigfoot"
			}
		},
		{
			"id": "monstres-gremlins-critters",
			"category": "monstres",
			"a": {
				"name": "Gremlins",
				"origin": "Joe Dante · 1984",
				"line": "Pas d’eau, pas de lumière, pas de repas après minuit.",
				"giphyIds": [],
				"giphyQuery": "Gremlins"
			},
			"b": {
				"name": "Critters",
				"origin": "Stephen Herek · 1986",
				"line": "Des boules de poils affamées venues de l’espace.",
				"giphyIds": [],
				"giphyQuery": "Critters"
			}
		},
		{
			"id": "monstres-sirene-centaure",
			"category": "monstres",
			"a": {
				"name": "Sirène",
				"origin": "Les océans",
				"line": "Une queue de poisson, et une voix envoûtante.",
				"giphyIds": [],
				"giphyQuery": "mermaid"
			},
			"b": {
				"name": "Centaure",
				"origin": "La Grèce antique",
				"line": "Un buste d’homme, un corps de cheval.",
				"giphyIds": [],
				"giphyQuery": "centaur"
			}
		},
		{
			"id": "monstres-le-minotaure-meduse",
			"category": "monstres",
			"a": {
				"name": "Le Minotaure",
				"origin": "Le labyrinthe",
				"line": "Une tête de taureau, et un très mauvais sens de l’orientation.",
				"giphyIds": [],
				"giphyQuery": "Minotaur"
			},
			"b": {
				"name": "Méduse",
				"origin": "La Grèce antique",
				"line": "Des serpents à la place des cheveux, et un regard qui pétrifie.",
				"giphyIds": [],
				"giphyQuery": "Medusa"
			}
		},
		{
			"id": "monstres-cyclope-hydre",
			"category": "monstres",
			"a": {
				"name": "Cyclope",
				"origin": "L’Odyssée",
				"line": "Un seul œil, et un gros caractère.",
				"giphyIds": [],
				"giphyQuery": "Cyclops"
			},
			"b": {
				"name": "Hydre",
				"origin": "Lerne",
				"line": "Tu coupes une tête, il en repousse deux.",
				"giphyIds": [],
				"giphyQuery": "Hydra"
			}
		},
		{
			"id": "monstres-gobelins-trolls",
			"category": "monstres",
			"a": {
				"name": "Gobelins",
				"origin": "Les cavernes",
				"line": "Petits, verts, et fous d’or.",
				"giphyIds": [],
				"giphyQuery": "goblin"
			},
			"b": {
				"name": "Trolls",
				"origin": "Sous les ponts",
				"line": "Grands, lents, et ils réclament un péage.",
				"giphyIds": [],
				"giphyQuery": "troll"
			}
		},
		{
			"id": "monstres-elfes-nains",
			"category": "monstres",
			"a": {
				"name": "Elfes",
				"origin": "Le Seigneur des anneaux",
				"line": "Grands, élégants, et des oreilles pointues.",
				"giphyIds": [],
				"giphyQuery": "Legolas elf"
			},
			"b": {
				"name": "Nains",
				"origin": "Le Seigneur des anneaux",
				"line": "Petits, barbus, et fous de mines.",
				"giphyIds": [],
				"giphyQuery": "Gimli dwarf"
			}
		},
		{
			"id": "monstres-hobbits-ents",
			"category": "monstres",
			"a": {
				"name": "Hobbits",
				"origin": "La Comté",
				"line": "Deux petits-déjeuners, et des pieds poilus.",
				"giphyIds": [],
				"giphyQuery": "hobbit"
			},
			"b": {
				"name": "Ents",
				"origin": "La forêt de Fangorn",
				"line": "Des arbres qui parlent, très, très lentement.",
				"giphyIds": [],
				"giphyQuery": "Ents Treebeard"
			}
		},
		{
			"id": "monstres-gollum-dobby",
			"category": "monstres",
			"a": {
				"name": "Gollum",
				"origin": "Le Seigneur des anneaux",
				"line": "« Mon précieux. »",
				"giphyIds": [],
				"giphyQuery": "Gollum"
			},
			"b": {
				"name": "Dobby",
				"origin": "Harry Potter",
				"line": "« Dobby est un elfe libre ! »",
				"giphyIds": [],
				"giphyQuery": "Dobby"
			}
		},
		{
			"id": "monstres-le-grinch-krampus",
			"category": "monstres",
			"a": {
				"name": "Le Grinch",
				"origin": "Dr. Seuss · 1957",
				"line": "Vert, grincheux, et voleur de Noël.",
				"giphyIds": [],
				"giphyQuery": "Grinch"
			},
			"b": {
				"name": "Krampus",
				"origin": "Les Alpes",
				"line": "Le compagnon terrifiant de saint Nicolas.",
				"giphyIds": [],
				"giphyQuery": "Krampus"
			}
		},
		{
			"id": "monstres-e-t-stitch",
			"category": "monstres",
			"a": {
				"name": "E.T.",
				"origin": "Steven Spielberg · 1982",
				"line": "« E.T. téléphone maison. »",
				"giphyIds": [],
				"giphyQuery": "ET phone home"
			},
			"b": {
				"name": "Stitch",
				"origin": "Disney · 2002",
				"line": "Expérience 626, petit monstre adorable.",
				"giphyIds": [],
				"giphyQuery": "Stitch"
			}
		},
		{
			"id": "monstres-les-martiens-de-mars-attacks-les-petits-gris",
			"category": "monstres",
			"a": {
				"name": "Les Martiens de Mars Attacks!",
				"origin": "Tim Burton · 1996",
				"line": "« Ack ack ! »",
				"giphyIds": [],
				"giphyQuery": "Mars Attacks"
			},
			"b": {
				"name": "Les petits gris",
				"origin": "Les ovnis",
				"line": "Grands yeux noirs, et soucoupe volante.",
				"giphyIds": [],
				"giphyQuery": "grey alien"
			}
		},
		{
			"id": "monstres-chupacabra-mothman",
			"category": "monstres",
			"a": {
				"name": "Chupacabra",
				"origin": "L’Amérique latine",
				"line": "Le suceur de chèvres.",
				"giphyIds": [],
				"giphyQuery": "Chupacabra"
			},
			"b": {
				"name": "Mothman",
				"origin": "La Virginie-Occidentale",
				"line": "Un homme-papillon aux yeux rouges.",
				"giphyIds": [],
				"giphyQuery": "Mothman"
			}
		},
		{
			"id": "monstres-phenix-griffon",
			"category": "monstres",
			"a": {
				"name": "Phénix",
				"origin": "Les légendes",
				"line": "Il meurt en flammes, et renaît de ses cendres.",
				"giphyIds": [],
				"giphyQuery": "phoenix bird"
			},
			"b": {
				"name": "Griffon",
				"origin": "Les légendes aussi",
				"line": "Moitié aigle, moitié lion.",
				"giphyIds": [],
				"giphyQuery": "griffin"
			}
		},
		{
			"id": "monstres-pegase-hippogriffe",
			"category": "monstres",
			"a": {
				"name": "Pégase",
				"origin": "La Grèce antique",
				"line": "Un cheval ailé, tout blanc.",
				"giphyIds": [],
				"giphyQuery": "Pegasus"
			},
			"b": {
				"name": "Hippogriffe",
				"origin": "Harry Potter",
				"line": "Moitié aigle, moitié cheval, et très susceptible.",
				"giphyIds": [],
				"giphyQuery": "Buckbeak hippogriff"
			}
		},
		{
			"id": "monstres-golem-gargouille",
			"category": "monstres",
			"a": {
				"name": "Golem",
				"origin": "La tradition juive",
				"line": "Un géant d’argile, obéissant.",
				"giphyIds": [],
				"giphyQuery": "golem"
			},
			"b": {
				"name": "Gargouille",
				"origin": "Les cathédrales",
				"line": "Elle garde les toits, et crache l’eau de pluie.",
				"giphyIds": [],
				"giphyQuery": "gargoyle"
			}
		},
		{
			"id": "monstres-kitsune-tanuki",
			"category": "monstres",
			"a": {
				"name": "Kitsune",
				"origin": "Le Japon",
				"line": "Un renard à neuf queues, rusé.",
				"giphyIds": [],
				"giphyQuery": "kitsune"
			},
			"b": {
				"name": "Tanuki",
				"origin": "Le Japon aussi",
				"line": "Un raton malicieux qui change de forme.",
				"giphyIds": [],
				"giphyQuery": "tanuki"
			}
		},
		{
			"id": "monstres-banshee-feu-follet",
			"category": "monstres",
			"a": {
				"name": "Banshee",
				"origin": "L’Irlande",
				"line": "Son cri annonce les mauvaises nouvelles.",
				"giphyIds": [],
				"giphyQuery": "banshee"
			},
			"b": {
				"name": "Feu follet",
				"origin": "Les marais",
				"line": "Une petite flamme qui égare les voyageurs.",
				"giphyIds": [],
				"giphyQuery": "will o wisp"
			}
		},
		{
			"id": "monstres-le-monstre-du-placard-le-monstre-sous-le-lit",
			"category": "monstres",
			"a": {
				"name": "Le monstre du placard",
				"origin": "Ta chambre",
				"line": "Il attend que tu fermes les yeux.",
				"giphyIds": [],
				"giphyQuery": "monster closet"
			},
			"b": {
				"name": "Le monstre sous le lit",
				"origin": "Ta chambre aussi",
				"line": "Il attend que tu poses un pied par terre.",
				"giphyIds": [],
				"giphyQuery": "monster under bed"
			}
		},
		{
			"id": "monstres-le-croque-mitaine-la-dame-blanche",
			"category": "monstres",
			"a": {
				"name": "Le Croque-mitaine",
				"origin": "Les histoires du soir",
				"line": "Il vient chercher les enfants qui ne dorment pas.",
				"giphyIds": [],
				"giphyQuery": "boogeyman"
			},
			"b": {
				"name": "La Dame blanche",
				"origin": "Les routes de campagne",
				"line": "Elle fait de l’auto-stop la nuit.",
				"giphyIds": [],
				"giphyQuery": "ghost woman"
			}
		},
		{
			"id": "monstres-la-bete-du-gevaudan-le-grand-mechant-loup",
			"category": "monstres",
			"a": {
				"name": "La Bête du Gévaudan",
				"origin": "Lozère · 1764",
				"line": "Une bête mystérieuse, jamais vraiment identifiée.",
				"giphyIds": [],
				"giphyQuery": "wolf beast"
			},
			"b": {
				"name": "Le grand méchant loup",
				"origin": "Les contes",
				"line": "Il souffle sur les maisons, et mange les grands-mères.",
				"giphyIds": [],
				"giphyQuery": "big bad wolf"
			}
		},
		{
			"id": "monstres-moby-dick-les-dents-de-la-mer",
			"category": "monstres",
			"a": {
				"name": "Moby Dick",
				"origin": "Herman Melville · 1851",
				"line": "Une baleine blanche, et une obsession.",
				"giphyIds": [],
				"giphyQuery": "Moby Dick whale"
			},
			"b": {
				"name": "Les Dents de la mer",
				"origin": "Steven Spielberg · 1975",
				"line": "Deux notes de musique, et plus personne ne se baigne.",
				"giphyIds": [],
				"giphyQuery": "Jaws shark"
			}
		},
		{
			"id": "monstres-sulli-bob-razowski",
			"category": "monstres",
			"a": {
				"name": "Sulli",
				"origin": "Monstres et Cie · 2001",
				"line": "Bleu, poilu, et finalement très doux.",
				"giphyIds": [],
				"giphyQuery": "Sulley Monsters Inc"
			},
			"b": {
				"name": "Bob Razowski",
				"origin": "Monstres et Cie · 2001",
				"line": "Un seul œil, et beaucoup d’humour.",
				"giphyIds": [],
				"giphyQuery": "Mike Wazowski"
			}
		},
		{
			"id": "monstres-macaron-le-glouton-oscar-le-grincheux",
			"category": "monstres",
			"a": {
				"name": "Macaron le glouton",
				"origin": "1, rue Sésame",
				"line": "« C’est moi Macaron ! » Et des biscuits partout.",
				"giphyIds": [],
				"giphyQuery": "Cookie Monster"
			},
			"b": {
				"name": "Oscar le grincheux",
				"origin": "1, rue Sésame",
				"line": "Il vit dans une poubelle, et il en est fier.",
				"giphyIds": [],
				"giphyQuery": "Oscar the Grouch"
			}
		},
		{
			"id": "monstres-casper-bouffe-tout",
			"category": "monstres",
			"a": {
				"name": "Casper",
				"origin": "Le fantôme gentil · 1945",
				"line": "Un fantôme qui veut juste des amis.",
				"giphyIds": [],
				"giphyQuery": "Casper"
			},
			"b": {
				"name": "Bouffe-tout",
				"origin": "SOS Fantômes · 1984",
				"line": "Vert, gluant, et affamé.",
				"giphyIds": [],
				"giphyQuery": "Slimer Ghostbusters"
			}
		},
		{
			"id": "monstres-le-bonhomme-chamallow-bibendum",
			"category": "monstres",
			"a": {
				"name": "Le bonhomme Chamallow",
				"origin": "SOS Fantômes · 1984",
				"line": "Un géant de guimauve qui marche sur New York.",
				"giphyIds": [],
				"giphyQuery": "Stay Puft marshmallow"
			},
			"b": {
				"name": "Bibendum",
				"origin": "Michelin · 1898",
				"line": "Un bonhomme en pneus, très souriant.",
				"giphyIds": [],
				"giphyQuery": "Michelin man"
			}
		},
		{
			"id": "monstres-pennywise-chucky",
			"category": "monstres",
			"a": {
				"name": "Pennywise",
				"origin": "Stephen King · 1986",
				"line": "Un clown, un ballon rouge, et une bouche d’égout.",
				"giphyIds": [],
				"giphyQuery": "Pennywise"
			},
			"b": {
				"name": "Chucky",
				"origin": "Jeu d’enfant · 1988",
				"line": "Une poupée qui n’est pas du tout un jouet.",
				"giphyIds": [],
				"giphyQuery": "Chucky doll"
			}
		},
		{
			"id": "monstres-detraqueurs-nazguls",
			"category": "monstres",
			"a": {
				"name": "Détraqueurs",
				"origin": "Harry Potter",
				"line": "Ils aspirent toute la joie. Mangez du chocolat.",
				"giphyIds": [],
				"giphyQuery": "Dementors"
			},
			"b": {
				"name": "Nazgûls",
				"origin": "Le Seigneur des anneaux",
				"line": "Neuf cavaliers noirs, et des cris perçants.",
				"giphyIds": [],
				"giphyQuery": "Nazgul"
			}
		},
		{
			"id": "monstres-smaug-drogon",
			"category": "monstres",
			"a": {
				"name": "Smaug",
				"origin": "Le Hobbit · 1937",
				"line": "Un dragon allongé sur une montagne d’or.",
				"giphyIds": [],
				"giphyQuery": "Smaug"
			},
			"b": {
				"name": "Drogon",
				"origin": "Game of Thrones · 2011",
				"line": "Le plus grand des dragons de Daenerys.",
				"giphyIds": [],
				"giphyQuery": "Drogon"
			}
		},
		{
			"id": "monstres-kaijus-jaegers",
			"category": "monstres",
			"a": {
				"name": "Kaijus",
				"origin": "Pacific Rim · 2013",
				"line": "Des monstres géants sortis de l’océan.",
				"giphyIds": ["C5HjYGn5OWuj8r6CcM"],
				"giphyQuery": "Pacific Rim monster"
			},
			"b": {
				"name": "Jaegers",
				"origin": "Pacific Rim · 2013",
				"line": "Des robots géants pilotés à deux.",
				"giphyIds": [],
				"giphyQuery": "Pacific Rim jaeger"
			}
		},
		{
			"id": "monstres-la-fee-clochette-le-genie",
			"category": "monstres",
			"a": {
				"name": "La fée Clochette",
				"origin": "Peter Pan · 1904",
				"line": "Petite, jalouse, et de la poudre de fée.",
				"giphyIds": [],
				"giphyQuery": "Tinker Bell"
			},
			"b": {
				"name": "Le Génie",
				"origin": "Aladdin · 1992",
				"line": "Trois vœux, et beaucoup d’imitations.",
				"giphyIds": [],
				"giphyQuery": "Genie Aladdin"
			}
		},
		{
			"id": "monstres-loup-garou-villageois",
			"category": "monstres",
			"a": {
				"name": "Loup-garou",
				"origin": "Le jeu de société",
				"line": "La nuit, il dévore un villageois.",
				"giphyIds": [],
				"giphyQuery": "werewolf game"
			},
			"b": {
				"name": "Villageois",
				"origin": "Le jeu de société aussi",
				"line": "Le jour, il accuse son voisin.",
				"giphyIds": [],
				"giphyQuery": "villagers mob"
			}
		},
		{
			"id": "monstres-malefique-ursula",
			"category": "monstres",
			"a": {
				"name": "Maléfique",
				"origin": "La Belle au bois dormant · 1959",
				"line": "Des cornes, un corbeau, et une rancune tenace.",
				"giphyIds": [],
				"giphyQuery": "Maleficent"
			},
			"b": {
				"name": "Ursula",
				"origin": "La Petite Sirène · 1989",
				"line": "Des tentacules, et des contrats douteux.",
				"giphyIds": [],
				"giphyQuery": "Ursula"
			}
		},
		{
			"id": "monstres-lutins-farfadets",
			"category": "monstres",
			"a": {
				"name": "Lutins",
				"origin": "Le pôle Nord",
				"line": "Ils fabriquent les jouets du père Noël.",
				"giphyIds": [],
				"giphyQuery": "elves christmas"
			},
			"b": {
				"name": "Farfadets",
				"origin": "Les forêts",
				"line": "Ils jouent des tours aux voyageurs.",
				"giphyIds": [],
				"giphyQuery": "leprechaun mischief"
			}
		},
		{
			"id": "monstres-djinn-leprechaun",
			"category": "monstres",
			"a": {
				"name": "Djinn",
				"origin": "Les Mille et Une Nuits",
				"line": "Un génie puissant, et capricieux.",
				"giphyIds": [],
				"giphyQuery": "djinn"
			},
			"b": {
				"name": "Leprechaun",
				"origin": "L’Irlande",
				"line": "Un petit homme vert, et un chaudron d’or.",
				"giphyIds": [],
				"giphyQuery": "leprechaun gold"
			}
		},
		{
			"id": "monstres-le-sphinx-la-chimere",
			"category": "monstres",
			"a": {
				"name": "Le Sphinx",
				"origin": "Thèbes",
				"line": "Une énigme, et gare à la mauvaise réponse.",
				"giphyIds": [],
				"giphyQuery": "sphinx"
			},
			"b": {
				"name": "La Chimère",
				"origin": "La Grèce antique",
				"line": "Lion, chèvre et serpent, en une seule bête.",
				"giphyIds": [],
				"giphyQuery": "chimera"
			}
		},
		{
			"id": "monstres-basilic-acromentule",
			"category": "monstres",
			"a": {
				"name": "Basilic",
				"origin": "Harry Potter",
				"line": "Un serpent géant, et un regard mortel.",
				"giphyIds": [],
				"giphyQuery": "basilisk"
			},
			"b": {
				"name": "Acromentule",
				"origin": "Harry Potter",
				"line": "Une araignée géante, et des enfants très nombreux.",
				"giphyIds": [],
				"giphyQuery": "Aragog spider"
			}
		},
		{
			"id": "monstres-baba-yaga-la-reine-de-blanche-neige",
			"category": "monstres",
			"a": {
				"name": "Baba Yaga",
				"origin": "Les contes russes",
				"line": "Une maison sur pattes de poulet.",
				"giphyIds": [],
				"giphyQuery": "Baba Yaga"
			},
			"b": {
				"name": "La Reine de Blanche-Neige",
				"origin": "Disney · 1937",
				"line": "« Miroir, mon beau miroir… »",
				"giphyIds": [],
				"giphyQuery": "Evil Queen Snow White"
			}
		},
		{
			"id": "monstres-zombie-lent-zombie-rapide",
			"category": "monstres",
			"a": {
				"name": "Zombie lent",
				"origin": "La Nuit des morts-vivants · 1968",
				"line": "Il marche doucement. On a le temps.",
				"giphyIds": [],
				"giphyQuery": "slow zombie"
			},
			"b": {
				"name": "Zombie rapide",
				"origin": "28 jours plus tard · 2002",
				"line": "Il sprinte. On n’a plus le temps.",
				"giphyIds": [],
				"giphyQuery": "fast zombie"
			}
		},
		{
			"id": "monstres-vampire-qui-brille-vampire-classique",
			"category": "monstres",
			"a": {
				"name": "Vampire qui brille",
				"origin": "Twilight · 2008",
				"line": "Il scintille au soleil.",
				"giphyIds": [],
				"giphyQuery": "Edward sparkle"
			},
			"b": {
				"name": "Vampire classique",
				"origin": "Dracula · 1897",
				"line": "Il brûle au soleil.",
				"giphyIds": [],
				"giphyQuery": "classic vampire"
			}
		},
		{
			"id": "monstres-les-tribbles-les-ewoks",
			"category": "monstres",
			"a": {
				"name": "Les Tribbles",
				"origin": "Star Trek · 1967",
				"line": "Des boules de poils qui se multiplient.",
				"giphyIds": [],
				"giphyQuery": "Tribbles"
			},
			"b": {
				"name": "Les Ewoks",
				"origin": "Star Wars · 1983",
				"line": "Des oursons qui battent l’Empire.",
				"giphyIds": [],
				"giphyQuery": "Ewoks"
			}
		},
		{
			"id": "monstres-la-momie-le-fantome-de-l-opera",
			"category": "monstres",
			"a": {
				"name": "La Momie",
				"origin": "Les pyramides",
				"line": "Des bandelettes, et une malédiction.",
				"giphyIds": [],
				"giphyQuery": "mummy"
			},
			"b": {
				"name": "Le Fantôme de l’Opéra",
				"origin": "Gaston Leroux · 1910",
				"line": "Un masque blanc, et un lustre qui tombe.",
				"giphyIds": [],
				"giphyQuery": "Phantom of the Opera"
			}
		},
		{
			"id": "animaux-panda-koala",
			"category": "animaux",
			"a": {
				"name": "Panda",
				"origin": "La Chine",
				"line": "Mange du bambou quatorze heures par jour.",
				"giphyIds": [],
				"giphyQuery": "panda"
			},
			"b": {
				"name": "Koala",
				"origin": "L’Australie",
				"line": "Dort vingt heures par jour.",
				"giphyIds": [],
				"giphyQuery": "koala"
			}
		},
		{
			"id": "animaux-requin-crocodile",
			"category": "animaux",
			"a": {
				"name": "Requin",
				"origin": "L’océan",
				"line": "Des dents qui repoussent toute sa vie.",
				"giphyIds": [],
				"giphyQuery": "shark"
			},
			"b": {
				"name": "Crocodile",
				"origin": "La rivière",
				"line": "Inchangé depuis les dinosaures, et ça lui va.",
				"giphyIds": [],
				"giphyQuery": "crocodile"
			}
		},
		{
			"id": "animaux-loutre-capybara",
			"category": "animaux",
			"a": {
				"name": "Loutre",
				"origin": "La rivière",
				"line": "Elle dort en tenant la main de ses amies.",
				"giphyIds": [],
				"giphyQuery": "otter"
			},
			"b": {
				"name": "Capybara",
				"origin": "L’Amérique du Sud",
				"line": "Le plus gros rongeur du monde, et le plus calme.",
				"giphyIds": [],
				"giphyQuery": "capybara"
			}
		},
		{
			"id": "animaux-pingouin-manchot",
			"category": "animaux",
			"a": {
				"name": "Pingouin",
				"origin": "L’Atlantique Nord",
				"line": "Il vole. Si, si.",
				"giphyIds": [],
				"giphyQuery": "puffin flying"
			},
			"b": {
				"name": "Manchot",
				"origin": "L’Antarctique",
				"line": "Il ne vole pas. Mais il nage très bien.",
				"giphyIds": [],
				"giphyQuery": "penguin swimming"
			}
		},
		{
			"id": "animaux-lion-tigre",
			"category": "animaux",
			"a": {
				"name": "Lion",
				"origin": "La savane",
				"line": "Le roi de la jungle, qui vit dans la savane.",
				"giphyIds": [],
				"giphyQuery": "lion"
			},
			"b": {
				"name": "Tigre",
				"origin": "L’Asie",
				"line": "Le plus grand de tous les félins.",
				"giphyIds": [],
				"giphyQuery": "tiger"
			}
		},
		{
			"id": "animaux-dauphin-orque",
			"category": "animaux",
			"a": {
				"name": "Dauphin",
				"origin": "L’océan",
				"line": "Intelligent, joueur, et toujours souriant.",
				"giphyIds": [],
				"giphyQuery": "dolphin"
			},
			"b": {
				"name": "Orque",
				"origin": "L’océan aussi",
				"line": "En fait, c’est le plus grand des dauphins.",
				"giphyIds": [],
				"giphyQuery": "orca"
			}
		},
		{
			"id": "animaux-hibou-chouette",
			"category": "animaux",
			"a": {
				"name": "Hibou",
				"origin": "La forêt",
				"line": "Il a des aigrettes sur la tête.",
				"giphyIds": [],
				"giphyQuery": "owl"
			},
			"b": {
				"name": "Chouette",
				"origin": "La forêt aussi",
				"line": "Elle n’en a pas. C’est tout.",
				"giphyIds": [],
				"giphyQuery": "barn owl"
			}
		},
		{
			"id": "animaux-lapin-cochon-d-inde",
			"category": "animaux",
			"a": {
				"name": "Lapin",
				"origin": "Le clapier",
				"line": "Des oreilles, des carottes, et des sauts de joie.",
				"giphyIds": [],
				"giphyQuery": "bunny"
			},
			"b": {
				"name": "Cochon d’Inde",
				"origin": "La cage",
				"line": "Des petits cris dès qu’on ouvre le frigo.",
				"giphyIds": [],
				"giphyQuery": "guinea pig"
			}
		},
		{
			"id": "animaux-paresseux-tortue",
			"category": "animaux",
			"a": {
				"name": "Paresseux",
				"origin": "La canopée",
				"line": "Descend de son arbre une fois par semaine.",
				"giphyIds": [],
				"giphyQuery": "sloth"
			},
			"b": {
				"name": "Tortue",
				"origin": "Le jardin",
				"line": "Elle a tout son temps. Vraiment tout.",
				"giphyIds": [],
				"giphyQuery": "tortoise"
			}
		},
		{
			"id": "animaux-girafe-elephant",
			"category": "animaux",
			"a": {
				"name": "Girafe",
				"origin": "La savane",
				"line": "Un cou immense, avec seulement sept vertèbres.",
				"giphyIds": [],
				"giphyQuery": "giraffe"
			},
			"b": {
				"name": "Éléphant",
				"origin": "La savane aussi",
				"line": "Une trompe, et une mémoire d’éléphant.",
				"giphyIds": [],
				"giphyQuery": "elephant"
			}
		},
		{
			"id": "animaux-pieuvre-calamar-geant",
			"category": "animaux",
			"a": {
				"name": "Pieuvre",
				"origin": "Les fonds marins",
				"line": "Huit bras, trois cœurs, du sang bleu.",
				"giphyIds": [],
				"giphyQuery": "octopus"
			},
			"b": {
				"name": "Calamar géant",
				"origin": "Les abysses",
				"line": "Des yeux grands comme des assiettes.",
				"giphyIds": [],
				"giphyQuery": "giant squid"
			}
		},
		{
			"id": "animaux-abeille-papillon",
			"category": "animaux",
			"a": {
				"name": "Abeille",
				"origin": "La ruche",
				"line": "Elle danse pour indiquer les fleurs.",
				"giphyIds": [],
				"giphyQuery": "bee"
			},
			"b": {
				"name": "Papillon",
				"origin": "Le jardin",
				"line": "Il goûte avec ses pattes.",
				"giphyIds": [],
				"giphyQuery": "butterfly"
			}
		},
		{
			"id": "animaux-pigeon-mouette",
			"category": "animaux",
			"a": {
				"name": "Pigeon",
				"origin": "La place de la mairie",
				"line": "Il connaît la ville mieux que toi.",
				"giphyIds": [],
				"giphyQuery": "pigeon"
			},
			"b": {
				"name": "Mouette",
				"origin": "Le port",
				"line": "Elle te vole tes frites, sans remords.",
				"giphyIds": [],
				"giphyQuery": "seagull stealing fries"
			}
		},
		{
			"id": "animaux-raton-laveur-opossum",
			"category": "animaux",
			"a": {
				"name": "Raton laveur",
				"origin": "La poubelle",
				"line": "Il lave sa nourriture, et fouille tes poubelles.",
				"giphyIds": [],
				"giphyQuery": "raccoon"
			},
			"b": {
				"name": "Opossum",
				"origin": "La route",
				"line": "Il fait le mort quand il a peur.",
				"giphyIds": [],
				"giphyQuery": "opossum"
			}
		},
		{
			"id": "animaux-chat-noir-chat-roux",
			"category": "animaux",
			"a": {
				"name": "Chat noir",
				"origin": "Le perron",
				"line": "Porte-bonheur ou malheur, selon les pays.",
				"giphyIds": [],
				"giphyQuery": "black cat"
			},
			"b": {
				"name": "Chat roux",
				"origin": "Le canapé",
				"line": "Une seule cellule grise, selon Internet.",
				"giphyIds": [],
				"giphyQuery": "orange cat"
			}
		},
		{
			"id": "animaux-golden-retriever-teckel",
			"category": "animaux",
			"a": {
				"name": "Golden retriever",
				"origin": "Le jardin",
				"line": "Aime absolument tout le monde.",
				"giphyIds": [],
				"giphyQuery": "golden retriever"
			},
			"b": {
				"name": "Teckel",
				"origin": "Le canapé",
				"line": "Un saucisson sur pattes, très fier.",
				"giphyIds": [],
				"giphyQuery": "dachshund"
			}
		},
		{
			"id": "animaux-lama-alpaga",
			"category": "animaux",
			"a": {
				"name": "Lama",
				"origin": "Les Andes",
				"line": "Il crache quand il n’est pas content.",
				"giphyIds": [],
				"giphyQuery": "llama"
			},
			"b": {
				"name": "Alpaga",
				"origin": "Les Andes aussi",
				"line": "Une laine douce, et une coupe de cheveux ridicule.",
				"giphyIds": [],
				"giphyQuery": "alpaca"
			}
		},
		{
			"id": "animaux-ornithorynque-axolotl",
			"category": "animaux",
			"a": {
				"name": "Ornithorynque",
				"origin": "L’Australie",
				"line": "Un bec de canard, il pond des œufs, et il est venimeux.",
				"giphyIds": [],
				"giphyQuery": "platypus"
			},
			"b": {
				"name": "Axolotl",
				"origin": "Le Mexique",
				"line": "Il fait repousser ses membres, et il sourit tout le temps.",
				"giphyIds": [],
				"giphyQuery": "axolotl"
			}
		},
		{
			"id": "animaux-ours-polaire-grizzly",
			"category": "animaux",
			"a": {
				"name": "Ours polaire",
				"origin": "La banquise",
				"line": "Une fourrure blanche sur une peau noire.",
				"giphyIds": [],
				"giphyQuery": "polar bear"
			},
			"b": {
				"name": "Grizzly",
				"origin": "Les Rocheuses",
				"line": "Il pêche le saumon à la main.",
				"giphyIds": [],
				"giphyQuery": "grizzly bear fishing"
			}
		},
		{
			"id": "animaux-la-fourmi-la-cigale",
			"category": "animaux",
			"a": {
				"name": "La Fourmi",
				"origin": "La Fontaine · 1668",
				"line": "Elle travaille tout l’été.",
				"giphyIds": [],
				"giphyQuery": "ant working"
			},
			"b": {
				"name": "La Cigale",
				"origin": "La Fontaine · 1668",
				"line": "Elle chante tout l’été.",
				"giphyIds": [],
				"giphyQuery": "cicada singing"
			}
		},
		{
			"id": "animaux-le-lievre-la-tortue",
			"category": "animaux",
			"a": {
				"name": "Le Lièvre",
				"origin": "La Fontaine · 1668",
				"line": "Rapide, mais trop sûr de lui.",
				"giphyIds": [],
				"giphyQuery": "hare running"
			},
			"b": {
				"name": "La Tortue",
				"origin": "La Fontaine · 1668",
				"line": "Lente, mais elle arrive la première.",
				"giphyIds": [],
				"giphyQuery": "turtle slow"
			}
		},
		{
			"id": "animaux-le-corbeau-le-renard",
			"category": "animaux",
			"a": {
				"name": "Le Corbeau",
				"origin": "La Fontaine · 1668",
				"line": "Un fromage dans le bec, et un ego fragile.",
				"giphyIds": [],
				"giphyQuery": "crow"
			},
			"b": {
				"name": "Le Renard",
				"origin": "La Fontaine · 1668",
				"line": "Un compliment, et le fromage est à lui.",
				"giphyIds": [],
				"giphyQuery": "fox"
			}
		},
		{
			"id": "animaux-chevre-mouton",
			"category": "animaux",
			"a": {
				"name": "Chèvre",
				"origin": "La montagne",
				"line": "Elle grimpe aux arbres. Si, si.",
				"giphyIds": [],
				"giphyQuery": "goat climbing tree"
			},
			"b": {
				"name": "Mouton",
				"origin": "Le pré",
				"line": "Il suit le troupeau, sans se poser de questions.",
				"giphyIds": [],
				"giphyQuery": "sheep"
			}
		},
		{
			"id": "animaux-vache-cochon",
			"category": "animaux",
			"a": {
				"name": "Vache",
				"origin": "Le pré",
				"line": "Quatre estomacs et beaucoup de patience.",
				"giphyIds": [],
				"giphyQuery": "cow"
			},
			"b": {
				"name": "Cochon",
				"origin": "La ferme",
				"line": "Plus intelligent que la plupart des chiens.",
				"giphyIds": [],
				"giphyQuery": "pig"
			}
		},
		{
			"id": "animaux-poisson-rouge-tortue-d-eau",
			"category": "animaux",
			"a": {
				"name": "Poisson rouge",
				"origin": "Le bocal",
				"line": "Trois secondes de mémoire, paraît-il. C’est faux.",
				"giphyIds": [],
				"giphyQuery": "goldfish"
			},
			"b": {
				"name": "Tortue d’eau",
				"origin": "L’aquarium",
				"line": "Elle bronze sur son rocher.",
				"giphyIds": [],
				"giphyQuery": "turtle basking"
			}
		},
		{
			"id": "animaux-gorille-orang-outan",
			"category": "animaux",
			"a": {
				"name": "Gorille",
				"origin": "La forêt tropicale",
				"line": "Le plus grand des primates.",
				"giphyIds": [],
				"giphyQuery": "gorilla"
			},
			"b": {
				"name": "Orang-outan",
				"origin": "Bornéo",
				"line": "Des cheveux roux, et une vie dans les arbres.",
				"giphyIds": [],
				"giphyQuery": "orangutan"
			}
		},
		{
			"id": "animaux-zebre-cheval",
			"category": "animaux",
			"a": {
				"name": "Zèbre",
				"origin": "La savane",
				"line": "Un cheval en pyjama.",
				"giphyIds": [],
				"giphyQuery": "zebra"
			},
			"b": {
				"name": "Cheval",
				"origin": "Le pré",
				"line": "Un zèbre sans pyjama.",
				"giphyIds": [],
				"giphyQuery": "horse"
			}
		},
		{
			"id": "animaux-flamant-rose-paon",
			"category": "animaux",
			"a": {
				"name": "Flamant rose",
				"origin": "Le lac salé",
				"line": "Rose grâce à ce qu’il mange.",
				"giphyIds": [],
				"giphyQuery": "flamingo"
			},
			"b": {
				"name": "Paon",
				"origin": "Le château",
				"line": "Une roue de plumes, et beaucoup de frime.",
				"giphyIds": [],
				"giphyQuery": "peacock"
			}
		},
		{
			"id": "animaux-herisson-porc-epic",
			"category": "animaux",
			"a": {
				"name": "Hérisson",
				"origin": "Le jardin",
				"line": "Il se roule en boule, et mange les limaces.",
				"giphyIds": [],
				"giphyQuery": "hedgehog"
			},
			"b": {
				"name": "Porc-épic",
				"origin": "La forêt",
				"line": "Des piquants bien plus longs, et pas de câlins.",
				"giphyIds": [],
				"giphyQuery": "porcupine"
			}
		},
		{
			"id": "animaux-kangourou-autruche",
			"category": "animaux",
			"a": {
				"name": "Kangourou",
				"origin": "L’Australie",
				"line": "Il ne sait pas reculer.",
				"giphyIds": [],
				"giphyQuery": "kangaroo"
			},
			"b": {
				"name": "Autruche",
				"origin": "L’Afrique",
				"line": "Le plus gros œuf du monde, et une course à 70 km/h.",
				"giphyIds": [],
				"giphyQuery": "ostrich running"
			}
		},
		{
			"id": "animaux-chameau-dromadaire",
			"category": "animaux",
			"a": {
				"name": "Chameau",
				"origin": "L’Asie",
				"line": "Deux bosses.",
				"giphyIds": [],
				"giphyQuery": "camel"
			},
			"b": {
				"name": "Dromadaire",
				"origin": "L’Afrique",
				"line": "Une seule bosse. Retiens-le enfin.",
				"giphyIds": [],
				"giphyQuery": "dromedary"
			}
		},
		{
			"id": "animaux-baleine-bleue-cachalot",
			"category": "animaux",
			"a": {
				"name": "Baleine bleue",
				"origin": "L’océan",
				"line": "Le plus grand animal de tous les temps.",
				"giphyIds": [],
				"giphyQuery": "blue whale"
			},
			"b": {
				"name": "Cachalot",
				"origin": "Les profondeurs",
				"line": "Il plonge à deux mille mètres.",
				"giphyIds": [],
				"giphyQuery": "sperm whale"
			}
		},
		{
			"id": "animaux-colibri-aigle",
			"category": "animaux",
			"a": {
				"name": "Colibri",
				"origin": "Les fleurs",
				"line": "Il vole en marche arrière.",
				"giphyIds": [],
				"giphyQuery": "hummingbird"
			},
			"b": {
				"name": "Aigle",
				"origin": "Les montagnes",
				"line": "Il voit un lapin à trois kilomètres.",
				"giphyIds": [],
				"giphyQuery": "eagle"
			}
		},
		{
			"id": "animaux-moustique-guepe",
			"category": "animaux",
			"question": "Le pire de l’été : le moustique ou la guêpe ?",
			"a": {
				"name": "Moustique",
				"origin": "La chambre, la nuit",
				"line": "Un bzzz dans l’oreille à trois heures du matin.",
				"giphyIds": [],
				"giphyQuery": "mosquito"
			},
			"b": {
				"name": "Guêpe",
				"origin": "La terrasse",
				"line": "Elle veut ta limonade, et elle l’aura.",
				"giphyIds": [],
				"giphyQuery": "wasp"
			}
		},
		{
			"id": "animaux-araignee-serpent",
			"category": "animaux",
			"question": "Ta plus grande peur : l’araignée ou le serpent ?",
			"a": {
				"name": "Araignée",
				"origin": "Le coin du plafond",
				"line": "Huit pattes, et elle te regarde.",
				"giphyIds": [],
				"giphyQuery": "spider"
			},
			"b": {
				"name": "Serpent",
				"origin": "Les hautes herbes",
				"line": "Pas de pattes, et il te regarde aussi.",
				"giphyIds": [],
				"giphyQuery": "snake"
			}
		},
		{
			"id": "animaux-chihuahua-dogue-allemand",
			"category": "animaux",
			"a": {
				"name": "Chihuahua",
				"origin": "Le sac à main",
				"line": "Le plus petit chien, le plus grand caractère.",
				"giphyIds": [],
				"giphyQuery": "chihuahua"
			},
			"b": {
				"name": "Dogue allemand",
				"origin": "Le canapé entier",
				"line": "Un poney qui se croit chien de salon.",
				"giphyIds": [],
				"giphyQuery": "great dane"
			}
		},
		{
			"id": "animaux-husky-corgi",
			"category": "animaux",
			"a": {
				"name": "Husky",
				"origin": "Le Grand Nord",
				"line": "Des yeux bleus, et des hurlements dramatiques.",
				"giphyIds": [],
				"giphyQuery": "husky howling"
			},
			"b": {
				"name": "Corgi",
				"origin": "Buckingham",
				"line": "Des pattes courtes, et des fesses célèbres.",
				"giphyIds": [],
				"giphyQuery": "corgi"
			}
		},
		{
			"id": "animaux-sphynx-persan",
			"category": "animaux",
			"a": {
				"name": "Sphynx",
				"origin": "Le radiateur",
				"line": "Un chat sans poils, toujours au chaud.",
				"giphyIds": [],
				"giphyQuery": "sphynx cat"
			},
			"b": {
				"name": "Persan",
				"origin": "Le coussin",
				"line": "Un chat très poilu, à la tête aplatie.",
				"giphyIds": [],
				"giphyQuery": "persian cat"
			}
		},
		{
			"id": "animaux-tortue-de-mer-hippocampe",
			"category": "animaux",
			"a": {
				"name": "Tortue de mer",
				"origin": "Les océans",
				"line": "Elle revient pondre sur la plage où elle est née.",
				"giphyIds": [],
				"giphyQuery": "sea turtle"
			},
			"b": {
				"name": "Hippocampe",
				"origin": "Les herbiers",
				"line": "Ce sont les papas qui portent les bébés.",
				"giphyIds": [],
				"giphyQuery": "seahorse"
			}
		},
		{
			"id": "animaux-fennec-renard-polaire",
			"category": "animaux",
			"a": {
				"name": "Fennec",
				"origin": "Le Sahara",
				"line": "Des oreilles géantes pour rester au frais.",
				"giphyIds": [],
				"giphyQuery": "fennec fox"
			},
			"b": {
				"name": "Renard polaire",
				"origin": "L’Arctique",
				"line": "Il devient tout blanc en hiver.",
				"giphyIds": [],
				"giphyQuery": "arctic fox"
			}
		},
		{
			"id": "animaux-panda-roux-suricate",
			"category": "animaux",
			"a": {
				"name": "Panda roux",
				"origin": "L’Himalaya",
				"line": "Une queue rayée, et une tête de peluche.",
				"giphyIds": [],
				"giphyQuery": "red panda"
			},
			"b": {
				"name": "Suricate",
				"origin": "Le Kalahari",
				"line": "Toujours de garde, debout sur ses pattes arrière.",
				"giphyIds": [],
				"giphyQuery": "meerkat"
			}
		},
		{
			"id": "animaux-perroquet-mainate",
			"category": "animaux",
			"a": {
				"name": "Perroquet",
				"origin": "La jungle",
				"line": "Il répète tout. Surtout ce qu’il ne faut pas.",
				"giphyIds": [],
				"giphyQuery": "parrot talking"
			},
			"b": {
				"name": "Mainate",
				"origin": "L’Asie",
				"line": "Il imite les voix mieux que ton cousin.",
				"giphyIds": [],
				"giphyQuery": "mynah bird"
			}
		},
		{
			"id": "animaux-taupe-castor",
			"category": "animaux",
			"a": {
				"name": "Taupe",
				"origin": "Le jardin",
				"line": "Elle creuse des galeries, et elle ne voit presque rien.",
				"giphyIds": [],
				"giphyQuery": "mole"
			},
			"b": {
				"name": "Castor",
				"origin": "La rivière",
				"line": "Il construit des barrages, et il est très doué.",
				"giphyIds": [],
				"giphyQuery": "beaver"
			}
		},
		{
			"id": "animaux-grenouille-crapaud",
			"category": "animaux",
			"a": {
				"name": "Grenouille",
				"origin": "La mare",
				"line": "Elle saute, elle coasse, elle attend un prince.",
				"giphyIds": [],
				"giphyQuery": "frog"
			},
			"b": {
				"name": "Crapaud",
				"origin": "La mare aussi",
				"line": "Plus de pustules, et autant de charme.",
				"giphyIds": [],
				"giphyQuery": "toad"
			}
		},
		{
			"id": "animaux-escargot-limace",
			"category": "animaux",
			"a": {
				"name": "Escargot",
				"origin": "Le jardin après la pluie",
				"line": "Il transporte sa maison.",
				"giphyIds": [],
				"giphyQuery": "snail"
			},
			"b": {
				"name": "Limace",
				"origin": "Le jardin aussi",
				"line": "Pareil, sans la maison.",
				"giphyIds": [],
				"giphyQuery": "slug"
			}
		},
		{
			"id": "animaux-otarie-phoque",
			"category": "animaux",
			"a": {
				"name": "Otarie",
				"origin": "Le port",
				"line": "Elle a de petites oreilles, et elle marche sur ses nageoires.",
				"giphyIds": [],
				"giphyQuery": "sea lion"
			},
			"b": {
				"name": "Phoque",
				"origin": "La banquise",
				"line": "Pas d’oreilles visibles, et il rampe sur le ventre.",
				"giphyIds": [],
				"giphyQuery": "seal"
			}
		},
		{
			"id": "animaux-narval-requin-marteau",
			"category": "animaux",
			"a": {
				"name": "Narval",
				"origin": "L’Arctique",
				"line": "Une corne qui est en fait une dent.",
				"giphyIds": [],
				"giphyQuery": "narwhal"
			},
			"b": {
				"name": "Requin-marteau",
				"origin": "Les mers chaudes",
				"line": "Une tête en forme de marteau, et une vue panoramique.",
				"giphyIds": [],
				"giphyQuery": "hammerhead shark"
			}
		},
		{
			"id": "animaux-tyrannosaure-velociraptor",
			"category": "animaux",
			"a": {
				"name": "Tyrannosaure",
				"origin": "Le Crétacé",
				"line": "Une mâchoire énorme, et des bras minuscules.",
				"giphyIds": [],
				"giphyQuery": "T-rex arms"
			},
			"b": {
				"name": "Vélociraptor",
				"origin": "Le Crétacé aussi",
				"line": "En vrai, il avait la taille d’une dinde, et des plumes.",
				"giphyIds": [],
				"giphyQuery": "velociraptor"
			}
		},
		{
			"id": "animaux-mammouth-tigre-a-dents-de-sabre",
			"category": "animaux",
			"a": {
				"name": "Mammouth",
				"origin": "L’ère glaciaire",
				"line": "Une fourrure épaisse, et des défenses immenses.",
				"giphyIds": [],
				"giphyQuery": "mammoth"
			},
			"b": {
				"name": "Tigre à dents de sabre",
				"origin": "L’ère glaciaire aussi",
				"line": "Deux crocs immenses, et un sale caractère.",
				"giphyIds": [],
				"giphyQuery": "saber tooth tiger"
			}
		},
		{
			"id": "animaux-cheval-poney",
			"category": "animaux",
			"a": {
				"name": "Cheval",
				"origin": "L’écurie",
				"line": "Grand, puissant, et élégant.",
				"giphyIds": [],
				"giphyQuery": "horse galloping"
			},
			"b": {
				"name": "Poney",
				"origin": "Le club hippique",
				"line": "Petit, têtu, et adorable.",
				"giphyIds": [],
				"giphyQuery": "pony"
			}
		},
		{
			"id": "monstres-la-fee-carabosse-la-bonne-fee",
			"category": "monstres",
			"a": {
				"name": "La fée Carabosse",
				"origin": "Les contes",
				"line": "Pas invitée au baptême, et elle s’en souvient.",
				"giphyIds": [],
				"giphyQuery": "evil fairy"
			},
			"b": {
				"name": "La bonne fée",
				"origin": "Cendrillon · 1950",
				"line": "Une citrouille, une baguette, et jusqu’à minuit.",
				"giphyIds": [],
				"giphyQuery": "fairy godmother"
			}
		},
		{
			"id": "heros-wonder-woman-captain-marvel",
			"category": "heros",
			"a": {
				"name": "Wonder Woman",
				"origin": "DC · 1941",
				"line": "Un lasso de vérité, et des bracelets pare-balles.",
				"giphyIds": [],
				"giphyQuery": "Wonder Woman"
			},
			"b": {
				"name": "Captain Marvel",
				"origin": "Marvel · 1968",
				"line": "Des poings photoniques, et un chat qui n’en est pas un.",
				"giphyIds": [],
				"giphyQuery": "Captain Marvel"
			}
		},
		{
			"id": "heros-thor-loki",
			"category": "heros",
			"a": {
				"name": "Thor",
				"origin": "Marvel · 1962",
				"line": "Un marteau, des éclairs, et des cheveux parfaits.",
				"giphyIds": [],
				"giphyQuery": "Thor hammer"
			},
			"b": {
				"name": "Loki",
				"origin": "Marvel · 1962",
				"line": "Dieu de la malice, avec toujours un plan de trop.",
				"giphyIds": [],
				"giphyQuery": "Loki"
			}
		},
		{
			"id": "heros-black-panther-black-widow",
			"category": "heros",
			"a": {
				"name": "Black Panther",
				"origin": "Marvel · 1966",
				"line": "« Wakanda pour toujours ! »",
				"giphyIds": [],
				"giphyQuery": "Black Panther"
			},
			"b": {
				"name": "Black Widow",
				"origin": "Marvel · 1964",
				"line": "Espionne, et toujours un coup d’avance.",
				"giphyIds": [],
				"giphyQuery": "Black Widow"
			}
		},
		{
			"id": "heros-aquaman-flash",
			"category": "heros",
			"a": {
				"name": "Aquaman",
				"origin": "DC · 1941",
				"line": "Il parle aux poissons. Les poissons l’écoutent.",
				"giphyIds": [],
				"giphyQuery": "Aquaman"
			},
			"b": {
				"name": "Flash",
				"origin": "DC · 1940",
				"line": "Le plus rapide de tous, et pourtant toujours en retard.",
				"giphyIds": [],
				"giphyQuery": "The Flash running"
			}
		},
		{
			"id": "heros-hellboy-le-punisher",
			"category": "heros",
			"a": {
				"name": "Hellboy",
				"origin": "Dark Horse · 1993",
				"line": "Des cornes limées et un faible pour les chats.",
				"giphyIds": [],
				"giphyQuery": "Hellboy"
			},
			"b": {
				"name": "Le Punisher",
				"origin": "Marvel · 1974",
				"line": "Une tête de mort sur le t-shirt, et zéro humour.",
				"giphyIds": [],
				"giphyQuery": "Punisher"
			}
		},
		{
			"id": "heros-magneto-professeur-x",
			"category": "heros",
			"a": {
				"name": "Magneto",
				"origin": "Marvel · 1963",
				"line": "Le maître du métal, et un casque contre la télépathie.",
				"giphyIds": [],
				"giphyQuery": "Magneto"
			},
			"b": {
				"name": "Professeur X",
				"origin": "Marvel · 1963",
				"line": "Un fauteuil roulant, et toutes tes pensées.",
				"giphyIds": [],
				"giphyQuery": "Professor X"
			}
		},
		{
			"id": "heros-lex-luthor-le-bouffon-vert",
			"category": "heros",
			"a": {
				"name": "Lex Luthor",
				"origin": "DC · 1940",
				"line": "Un génie chauve, très jaloux d’un Kryptonien.",
				"giphyIds": [],
				"giphyQuery": "Lex Luthor"
			},
			"b": {
				"name": "Le Bouffon vert",
				"origin": "Marvel · 1964",
				"line": "Un planeur, et des citrouilles explosives.",
				"giphyIds": [],
				"giphyQuery": "Green Goblin"
			}
		},
		{
			"id": "heros-harley-quinn-catwoman",
			"category": "heros",
			"a": {
				"name": "Harley Quinn",
				"origin": "DC · 1992",
				"line": "Une batte de baseball et des couettes bicolores.",
				"giphyIds": [],
				"giphyQuery": "Harley Quinn"
			},
			"b": {
				"name": "Catwoman",
				"origin": "DC · 1940",
				"line": "Voleuse de bijoux, avec neuf vies.",
				"giphyIds": [],
				"giphyQuery": "Catwoman"
			}
		},
		{
			"id": "heros-le-sphinx-le-pingouin",
			"category": "heros",
			"a": {
				"name": "Le Sphinx",
				"origin": "DC · 1948",
				"line": "Des énigmes partout, même sur son costume.",
				"giphyIds": [],
				"giphyQuery": "Riddler"
			},
			"b": {
				"name": "Le Pingouin",
				"origin": "DC · 1941",
				"line": "Un parapluie, un monocle, un haut-de-forme.",
				"giphyIds": [],
				"giphyQuery": "Penguin Batman"
			}
		},
		{
			"id": "heros-daredevil-ant-man",
			"category": "heros",
			"a": {
				"name": "Daredevil",
				"origin": "Marvel · 1964",
				"line": "Aveugle, mais il voit tout venir.",
				"giphyIds": [],
				"giphyQuery": "Daredevil"
			},
			"b": {
				"name": "Ant-Man",
				"origin": "Marvel · 1962",
				"line": "Minuscule, mais redoutable.",
				"giphyIds": [],
				"giphyQuery": "Ant-Man"
			}
		},
		{
			"id": "heros-doctor-strange-la-sorciere-rouge",
			"category": "heros",
			"a": {
				"name": "Doctor Strange",
				"origin": "Marvel · 1963",
				"line": "Une cape qui a sa propre volonté.",
				"giphyIds": [],
				"giphyQuery": "Doctor Strange"
			},
			"b": {
				"name": "La Sorcière rouge",
				"origin": "Marvel · 1964",
				"line": "De la magie du chaos, et une puissance folle.",
				"giphyIds": [],
				"giphyQuery": "Scarlet Witch"
			}
		},
		{
			"id": "heros-les-avengers-la-justice-league",
			"category": "heros",
			"a": {
				"name": "Les Avengers",
				"origin": "Marvel · 1963",
				"line": "Les héros de la Terre, quand ils arrivent à s’entendre.",
				"giphyIds": [],
				"giphyQuery": "Avengers assemble"
			},
			"b": {
				"name": "La Justice League",
				"origin": "DC · 1960",
				"line": "Les dieux de l’Olympe, version cape.",
				"giphyIds": [],
				"giphyQuery": "Justice League"
			}
		},
		{
			"id": "heros-les-x-men-les-gardiens-de-la-galaxie",
			"category": "heros",
			"a": {
				"name": "Les X-Men",
				"origin": "Marvel · 1963",
				"line": "Une école pour mutants, et beaucoup de drames.",
				"giphyIds": [],
				"giphyQuery": "X-Men"
			},
			"b": {
				"name": "Les Gardiens de la Galaxie",
				"origin": "Marvel · 2008",
				"line": "Un raton laveur, un arbre, et une cassette audio.",
				"giphyIds": [],
				"giphyQuery": "Guardians of the Galaxy"
			}
		},
		{
			"id": "heros-groot-rocket",
			"category": "heros",
			"a": {
				"name": "Groot",
				"origin": "Marvel · 1960",
				"line": "« Je s’appelle Groot. »",
				"giphyIds": [],
				"giphyQuery": "Groot"
			},
			"b": {
				"name": "Rocket",
				"origin": "Marvel · 1976",
				"line": "Un raton laveur. Enfin, ne le lui dis pas.",
				"giphyIds": [],
				"giphyQuery": "Rocket Raccoon"
			}
		},
		{
			"id": "heros-luffy-saitama",
			"category": "heros",
			"a": {
				"name": "Luffy",
				"origin": "One Piece · 1997",
				"line": "Un chapeau de paille, et un corps en caoutchouc.",
				"giphyIds": [],
				"giphyQuery": "Luffy"
			},
			"b": {
				"name": "Saitama",
				"origin": "One Punch Man · 2009",
				"line": "Un seul coup de poing, et c’est fini.",
				"giphyIds": [],
				"giphyQuery": "Saitama One Punch"
			}
		},
		{
			"id": "heros-sauron-saroumane",
			"category": "heros",
			"a": {
				"name": "Sauron",
				"origin": "Tolkien · 1954",
				"line": "Un œil, une tour, et beaucoup de mauvaises intentions.",
				"giphyIds": [],
				"giphyQuery": "Eye of Sauron"
			},
			"b": {
				"name": "Saroumane",
				"origin": "Tolkien · 1954",
				"line": "Le magicien blanc qui a mal tourné.",
				"giphyIds": [],
				"giphyQuery": "Saruman"
			}
		},
		{
			"id": "heros-le-capitaine-crochet-jafar",
			"category": "heros",
			"a": {
				"name": "Le Capitaine Crochet",
				"origin": "Peter Pan · 1904",
				"line": "Un crochet, et une peur bleue des crocodiles.",
				"giphyIds": [],
				"giphyQuery": "Captain Hook"
			},
			"b": {
				"name": "Jafar",
				"origin": "Aladdin · 1992",
				"line": "Un perroquet, un sceptre, et de grandes ambitions.",
				"giphyIds": [],
				"giphyQuery": "Jafar"
			}
		},
		{
			"id": "heros-scar-cruella",
			"category": "heros",
			"a": {
				"name": "Scar",
				"origin": "Le Roi lion · 1994",
				"line": "« Soyez prêtes ! »",
				"giphyIds": [],
				"giphyQuery": "Scar Lion King"
			},
			"b": {
				"name": "Cruella",
				"origin": "Les 101 Dalmatiens · 1961",
				"line": "Une passion inquiétante pour les manteaux à taches.",
				"giphyIds": [],
				"giphyQuery": "Cruella de Vil"
			}
		},
		{
			"id": "heros-dark-maul-le-general-grievous",
			"category": "heros",
			"a": {
				"name": "Dark Maul",
				"origin": "Star Wars · 1999",
				"line": "Un sabre double, et très peu de dialogues.",
				"giphyIds": [],
				"giphyQuery": "Darth Maul"
			},
			"b": {
				"name": "Le général Grievous",
				"origin": "Star Wars · 2005",
				"line": "Quatre bras, quatre sabres, et une toux.",
				"giphyIds": [],
				"giphyQuery": "General Grievous"
			}
		},
		{
			"id": "heros-obi-wan-kenobi-yoda",
			"category": "heros",
			"a": {
				"name": "Obi-Wan Kenobi",
				"origin": "Star Wars · 1977",
				"line": "« Hello there. »",
				"giphyIds": [],
				"giphyQuery": "Obi-Wan Kenobi"
			},
			"b": {
				"name": "Yoda",
				"origin": "Star Wars · 1980",
				"line": "Petit, vert, et une grammaire très originale.",
				"giphyIds": [],
				"giphyQuery": "Yoda"
			}
		},
		{
			"id": "heros-neo-morpheus",
			"category": "heros",
			"a": {
				"name": "Neo",
				"origin": "Matrix · 1999",
				"line": "La pilule rouge, et des ralentis.",
				"giphyIds": [],
				"giphyQuery": "Neo Matrix"
			},
			"b": {
				"name": "Morpheus",
				"origin": "Matrix · 1999",
				"line": "Il te laisse choisir la pilule.",
				"giphyIds": [],
				"giphyQuery": "Morpheus pills"
			}
		},
		{
			"id": "heros-john-mcclane-jack-bauer",
			"category": "heros",
			"a": {
				"name": "John McClane",
				"origin": "Piège de cristal · 1988",
				"line": "Pieds nus, en débardeur, il sauve tout le monde.",
				"giphyIds": [],
				"giphyQuery": "John McClane"
			},
			"b": {
				"name": "Jack Bauer",
				"origin": "24 heures chrono · 2001",
				"line": "Vingt-quatre heures, et pas une pause.",
				"giphyIds": [],
				"giphyQuery": "Jack Bauer"
			}
		},
		{
			"id": "heros-macgyver-l-agence-tous-risques",
			"category": "heros",
			"a": {
				"name": "MacGyver",
				"origin": "Série télé · 1985",
				"line": "Un couteau suisse, un trombone, et le tour est joué.",
				"giphyIds": [],
				"giphyQuery": "MacGyver"
			},
			"b": {
				"name": "L’Agence tous risques",
				"origin": "Série télé · 1983",
				"line": "« J’adore quand un plan se déroule sans accroc. »",
				"giphyIds": [],
				"giphyQuery": "A-Team"
			}
		},
		{
			"id": "heros-le-marsupilami-gaston-lagaffe",
			"category": "heros",
			"a": {
				"name": "Le Marsupilami",
				"origin": "Franquin · 1952",
				"line": "« Houba houba ! »",
				"giphyIds": [],
				"giphyQuery": "Marsupilami"
			},
			"b": {
				"name": "Gaston Lagaffe",
				"origin": "Franquin · 1957",
				"line": "« M’enfin ! »",
				"giphyIds": [],
				"giphyQuery": "Gaston Lagaffe"
			}
		},
		{
			"id": "heros-spirou-blake-et-mortimer",
			"category": "heros",
			"a": {
				"name": "Spirou",
				"origin": "Rob-Vel · 1938",
				"line": "Un groom, un écureuil, et des aventures.",
				"giphyIds": [],
				"giphyQuery": "Spirou"
			},
			"b": {
				"name": "Blake et Mortimer",
				"origin": "Edgar P. Jacobs · 1946",
				"line": "La marque jaune, et des complots.",
				"giphyIds": [],
				"giphyQuery": "Blake and Mortimer"
			}
		},
		{
			"id": "heros-iznogoud-les-dalton",
			"category": "heros",
			"a": {
				"name": "Iznogoud",
				"origin": "Goscinny et Tabary · 1962",
				"line": "Il veut être calife à la place du calife.",
				"giphyIds": [],
				"giphyQuery": "Iznogoud"
			},
			"b": {
				"name": "Les Dalton",
				"origin": "Morris · 1951",
				"line": "Quatre frères, rangés du plus petit au plus grand.",
				"giphyIds": [],
				"giphyQuery": "Daltons"
			}
		},
		{
			"id": "heros-arsene-lupin-le-comte-de-monte-cristo",
			"category": "heros",
			"a": {
				"name": "Arsène Lupin",
				"origin": "Maurice Leblanc · 1905",
				"line": "Le gentleman cambrioleur.",
				"giphyIds": [],
				"giphyQuery": "Arsene Lupin"
			},
			"b": {
				"name": "Le Comte de Monte-Cristo",
				"origin": "Alexandre Dumas · 1844",
				"line": "La vengeance, servie très froide.",
				"giphyIds": [],
				"giphyQuery": "Count of Monte Cristo"
			}
		},
		{
			"id": "heros-hercule-achille",
			"category": "heros",
			"a": {
				"name": "Hercule",
				"origin": "Disney · 1997",
				"line": "Un demi-dieu, et un coach satyre.",
				"giphyIds": [],
				"giphyQuery": "Hercules Disney"
			},
			"b": {
				"name": "Achille",
				"origin": "L’Iliade",
				"line": "Invincible, sauf au talon.",
				"giphyIds": [],
				"giphyQuery": "Achilles"
			}
		},
		{
			"id": "heros-ulysse-jason",
			"category": "heros",
			"a": {
				"name": "Ulysse",
				"origin": "L’Odyssée",
				"line": "Dix ans pour rentrer chez lui.",
				"giphyIds": ["vd7zIvHKK8MBI3izXj"],
				"giphyQuery": "Odysseus"
			},
			"b": {
				"name": "Jason",
				"origin": "Les Argonautes",
				"line": "Une toison d’or, et un bateau plein de héros.",
				"giphyIds": [],
				"giphyQuery": "Jason Argonauts"
			}
		},
		{
			"id": "heros-ripley-sarah-connor",
			"category": "heros",
			"a": {
				"name": "Ripley",
				"origin": "Alien · 1979",
				"line": "Seule face à l’Alien, et toujours debout.",
				"giphyIds": [],
				"giphyQuery": "Ripley Alien"
			},
			"b": {
				"name": "Sarah Connor",
				"origin": "Terminator · 1984",
				"line": "De serveuse à guerrière, en deux films.",
				"giphyIds": [],
				"giphyQuery": "Sarah Connor"
			}
		},
		{
			"id": "heros-katniss-everdeen-hermione-granger",
			"category": "heros",
			"a": {
				"name": "Katniss Everdeen",
				"origin": "Hunger Games · 2008",
				"line": "Un arc, une tresse, et une révolution.",
				"giphyIds": [],
				"giphyQuery": "Katniss"
			},
			"b": {
				"name": "Hermione Granger",
				"origin": "Harry Potter · 1997",
				"line": "Elle a tout lu, et elle te l’a dit.",
				"giphyIds": [],
				"giphyQuery": "Hermione"
			}
		},
		{
			"id": "heros-severus-rogue-hagrid",
			"category": "heros",
			"a": {
				"name": "Severus Rogue",
				"origin": "Harry Potter · 1997",
				"line": "« Toujours. »",
				"giphyIds": [],
				"giphyQuery": "Snape"
			},
			"b": {
				"name": "Hagrid",
				"origin": "Harry Potter · 1997",
				"line": "« T’es un sorcier, Harry. »",
				"giphyIds": [],
				"giphyQuery": "Hagrid"
			}
		},
		{
			"id": "heros-tarzan-mowgli",
			"category": "heros",
			"a": {
				"name": "Tarzan",
				"origin": "Edgar Rice Burroughs · 1912",
				"line": "Élevé par des singes, et il crie très fort.",
				"giphyIds": [],
				"giphyQuery": "Tarzan"
			},
			"b": {
				"name": "Mowgli",
				"origin": "Rudyard Kipling · 1894",
				"line": "Élevé par des loups, et il chante avec un ours.",
				"giphyIds": [],
				"giphyQuery": "Mowgli"
			}
		},
		{
			"id": "heros-peter-pan-le-petit-prince",
			"category": "heros",
			"a": {
				"name": "Peter Pan",
				"origin": "J. M. Barrie · 1904",
				"line": "Ne veut pas grandir.",
				"giphyIds": [],
				"giphyQuery": "Peter Pan"
			},
			"b": {
				"name": "Le Petit Prince",
				"origin": "Saint-Exupéry · 1943",
				"line": "« Dessine-moi un mouton. »",
				"giphyIds": [],
				"giphyQuery": "Little Prince"
			}
		},
		{
			"id": "heros-cendrillon-blanche-neige",
			"category": "heros",
			"a": {
				"name": "Cendrillon",
				"origin": "Disney · 1950",
				"line": "Une pantoufle de verre, et un couvre-feu à minuit.",
				"giphyIds": [],
				"giphyQuery": "Cinderella"
			},
			"b": {
				"name": "Blanche-Neige",
				"origin": "Disney · 1937",
				"line": "Sept colocataires, et une pomme suspecte.",
				"giphyIds": [],
				"giphyQuery": "Snow White"
			}
		},
		{
			"id": "heros-le-chat-botte-le-petit-chaperon-rouge",
			"category": "heros",
			"a": {
				"name": "Le Chat botté",
				"origin": "Perrault · 1697",
				"line": "Des bottes, et beaucoup de baratin.",
				"giphyIds": [],
				"giphyQuery": "Puss in Boots"
			},
			"b": {
				"name": "Le Petit Chaperon rouge",
				"origin": "Perrault · 1697",
				"line": "Une galette, un petit pot de beurre, et un loup.",
				"giphyIds": [],
				"giphyQuery": "Red Riding Hood"
			}
		},
		{
			"id": "bouffe-croissant-pain-au-chocolat",
			"category": "bouffe",
			"a": {
				"name": "Croissant",
				"origin": "La boulangerie",
				"line": "Du beurre, une forme de lune, et des miettes partout.",
				"giphyIds": [],
				"giphyQuery": "croissant"
			},
			"b": {
				"name": "Pain au chocolat",
				"origin": "La boulangerie aussi",
				"line": "Deux barres de chocolat pour bien commencer.",
				"giphyIds": [],
				"giphyQuery": "chocolate pastry"
			}
		},
		{
			"id": "bouffe-camembert-brie",
			"category": "bouffe",
			"a": {
				"name": "Camembert",
				"origin": "Normandie",
				"line": "Coulant, odorant, et rond.",
				"giphyIds": [],
				"giphyQuery": "camembert cheese"
			},
			"b": {
				"name": "Brie",
				"origin": "Île-de-France",
				"line": "Coulant aussi, mais en plus grand.",
				"giphyIds": [],
				"giphyQuery": "brie cheese"
			}
		},
		{
			"id": "bouffe-comte-emmental",
			"category": "bouffe",
			"a": {
				"name": "Comté",
				"origin": "Le Jura",
				"line": "Fruité, affiné, et toujours trop vite fini.",
				"giphyIds": [],
				"giphyQuery": "comte cheese"
			},
			"b": {
				"name": "Emmental",
				"origin": "La Suisse et la France",
				"line": "Des trous, et du fil sur la pizza.",
				"giphyIds": [],
				"giphyQuery": "swiss cheese holes"
			}
		},
		{
			"id": "bouffe-biere-vin",
			"category": "bouffe",
			"a": {
				"name": "Bière",
				"origin": "La brasserie",
				"line": "Mousse, houblon, et chips à côté.",
				"giphyIds": [],
				"giphyQuery": "beer cheers"
			},
			"b": {
				"name": "Vin",
				"origin": "La cave",
				"line": "Un verre, un plateau, et des avis d’expert.",
				"giphyIds": [],
				"giphyQuery": "wine glass"
			}
		},
		{
			"id": "bouffe-vin-rouge-vin-blanc",
			"category": "bouffe",
			"a": {
				"name": "Vin rouge",
				"origin": "La cave",
				"line": "Le fromage, la viande, et les taches sur la nappe.",
				"giphyIds": [],
				"giphyQuery": "red wine"
			},
			"b": {
				"name": "Vin blanc",
				"origin": "La cave aussi",
				"line": "Les huîtres, le poisson, et la terrasse.",
				"giphyIds": [],
				"giphyQuery": "white wine"
			}
		},
		{
			"id": "bouffe-champagne-prosecco",
			"category": "bouffe",
			"a": {
				"name": "Champagne",
				"origin": "La Champagne",
				"line": "Des bulles, et l’impression d’une fête.",
				"giphyIds": [],
				"giphyQuery": "champagne pop"
			},
			"b": {
				"name": "Prosecco",
				"origin": "L’Italie",
				"line": "Des bulles aussi, pour moins cher.",
				"giphyIds": [],
				"giphyQuery": "prosecco"
			}
		},
		{
			"id": "bouffe-pastis-rose",
			"category": "bouffe",
			"a": {
				"name": "Pastis",
				"origin": "Le Sud",
				"line": "Jaune, anisé, et la pétanque à côté.",
				"giphyIds": [],
				"giphyQuery": "pastis"
			},
			"b": {
				"name": "Rosé",
				"origin": "La Provence",
				"line": "Bien frais, en terrasse, tout l’été.",
				"giphyIds": [],
				"giphyQuery": "rose wine"
			}
		},
		{
			"id": "bouffe-fromage-dessert",
			"category": "bouffe",
			"question": "Fin de repas : fromage ou dessert ?",
			"a": {
				"name": "Fromage",
				"origin": "Le plateau",
				"line": "On finit le pain, puis on en reprend pour finir le fromage.",
				"giphyIds": [],
				"giphyQuery": "cheese platter"
			},
			"b": {
				"name": "Dessert",
				"origin": "La pâtisserie",
				"line": "On a toujours une deuxième place pour le dessert.",
				"giphyIds": [],
				"giphyQuery": "dessert"
			}
		},
		{
			"id": "bouffe-uf-a-la-coque-uf-au-plat",
			"category": "bouffe",
			"a": {
				"name": "Œuf à la coque",
				"origin": "Le coquetier",
				"line": "Des mouillettes, et un jaune qui coule.",
				"giphyIds": [],
				"giphyQuery": "soft boiled egg"
			},
			"b": {
				"name": "Œuf au plat",
				"origin": "La poêle",
				"line": "Un soleil dans l’assiette.",
				"giphyIds": [],
				"giphyQuery": "fried egg"
			}
		},
		{
			"id": "bouffe-steak-saignant-steak-bien-cuit",
			"category": "bouffe",
			"question": "Ton steak : saignant ou bien cuit ?",
			"a": {
				"name": "Steak saignant",
				"origin": "La boucherie",
				"line": "Rouge au cœur, et fier de l’être.",
				"giphyIds": [],
				"giphyQuery": "rare steak"
			},
			"b": {
				"name": "Steak bien cuit",
				"origin": "La poêle",
				"line": "Cuit, et sans négociation.",
				"giphyIds": [],
				"giphyQuery": "well done steak"
			}
		},
		{
			"id": "bouffe-pizza-tacos-francais",
			"category": "bouffe",
			"a": {
				"name": "Pizza",
				"origin": "Naples",
				"line": "Une pâte fine et du fromage qui file.",
				"giphyIds": [],
				"giphyQuery": "pizza"
			},
			"b": {
				"name": "Tacos français",
				"origin": "Lyon et Grenoble",
				"line": "Des frites dedans, de la sauce fromagère partout.",
				"giphyIds": [],
				"giphyQuery": "french tacos"
			}
		},
		{
			"id": "bouffe-sushi-ramen",
			"category": "bouffe",
			"a": {
				"name": "Sushi",
				"origin": "Le Japon",
				"line": "Du riz, du poisson, et des baguettes maladroites.",
				"giphyIds": [],
				"giphyQuery": "sushi"
			},
			"b": {
				"name": "Ramen",
				"origin": "Le Japon aussi",
				"line": "Un bouillon brûlant et des nouilles à aspirer.",
				"giphyIds": [],
				"giphyQuery": "ramen"
			}
		},
		{
			"id": "bouffe-moutarde-de-dijon-moutarde-a-l-ancienne",
			"category": "bouffe",
			"a": {
				"name": "Moutarde de Dijon",
				"origin": "La Bourgogne",
				"line": "Forte, lisse, et elle monte au nez.",
				"giphyIds": [],
				"giphyQuery": "mustard"
			},
			"b": {
				"name": "Moutarde à l’ancienne",
				"origin": "La Bourgogne aussi",
				"line": "Des grains, et du caractère.",
				"giphyIds": [],
				"giphyQuery": "grainy mustard"
			}
		},
		{
			"id": "bouffe-glace-vanille-glace-chocolat",
			"category": "bouffe",
			"a": {
				"name": "Glace vanille",
				"origin": "Le congélateur",
				"line": "Un classique, à la gousse noire.",
				"giphyIds": [],
				"giphyQuery": "vanilla ice cream"
			},
			"b": {
				"name": "Glace chocolat",
				"origin": "Le congélateur aussi",
				"line": "Un classique, à la cuillère.",
				"giphyIds": [],
				"giphyQuery": "chocolate ice cream"
			}
		},
		{
			"id": "bouffe-glace-en-cornet-glace-en-pot",
			"category": "bouffe",
			"a": {
				"name": "Glace en cornet",
				"origin": "Le marchand de glaces",
				"line": "Elle coule sur la main en trente secondes.",
				"giphyIds": [],
				"giphyQuery": "ice cream cone"
			},
			"b": {
				"name": "Glace en pot",
				"origin": "Le canapé",
				"line": "Une cuillère, et la série du soir.",
				"giphyIds": [],
				"giphyQuery": "ice cream tub"
			}
		},
		{
			"id": "bouffe-tarte-aux-pommes-tarte-au-citron",
			"category": "bouffe",
			"a": {
				"name": "Tarte aux pommes",
				"origin": "Mamie",
				"line": "Des pommes en rosace, et la cannelle.",
				"giphyIds": [],
				"giphyQuery": "apple pie"
			},
			"b": {
				"name": "Tarte au citron",
				"origin": "La pâtisserie",
				"line": "Acidulée, meringuée, et dorée au chalumeau.",
				"giphyIds": [],
				"giphyQuery": "lemon tart"
			}
		},
		{
			"id": "bouffe-eclair-religieuse",
			"category": "bouffe",
			"a": {
				"name": "Éclair",
				"origin": "La pâtisserie",
				"line": "Un long chou, et du chocolat dessus.",
				"giphyIds": [],
				"giphyQuery": "eclair pastry"
			},
			"b": {
				"name": "Religieuse",
				"origin": "La pâtisserie aussi",
				"line": "Deux choux l’un sur l’autre, et une collerette.",
				"giphyIds": [],
				"giphyQuery": "religieuse pastry"
			}
		},
		{
			"id": "bouffe-macaron-madeleine",
			"category": "bouffe",
			"a": {
				"name": "Macaron",
				"origin": "Paris",
				"line": "Coloré, fragile, et cher à la pièce.",
				"giphyIds": [],
				"giphyQuery": "macarons"
			},
			"b": {
				"name": "Madeleine",
				"origin": "Commercy",
				"line": "Une bosse dorée et des souvenirs d’enfance.",
				"giphyIds": [],
				"giphyQuery": "madeleine"
			}
		},
		{
			"id": "bouffe-galette-des-rois-brioche-des-rois",
			"category": "bouffe",
			"question": "En janvier : galette ou brioche des rois ?",
			"a": {
				"name": "Galette des rois",
				"origin": "La moitié nord",
				"line": "Frangipane, fève, et couronne en carton.",
				"giphyIds": [],
				"giphyQuery": "galette des rois"
			},
			"b": {
				"name": "Brioche des rois",
				"origin": "La moitié sud",
				"line": "Des fruits confits, du sucre, et la fève aussi.",
				"giphyIds": [],
				"giphyQuery": "king cake brioche"
			}
		},
		{
			"id": "bouffe-buche-glacee-buche-patissiere",
			"category": "bouffe",
			"a": {
				"name": "Bûche glacée",
				"origin": "Le congélateur",
				"line": "Fraîche, après un repas de cinq heures.",
				"giphyIds": [],
				"giphyQuery": "ice cream cake"
			},
			"b": {
				"name": "Bûche pâtissière",
				"origin": "La boulangerie",
				"line": "Crème au beurre, et petit nain en plastique.",
				"giphyIds": [],
				"giphyQuery": "yule log cake"
			}
		},
		{
			"id": "bouffe-chips-nature-chips-au-paprika",
			"category": "bouffe",
			"a": {
				"name": "Chips nature",
				"origin": "Le paquet",
				"line": "Le sel, et rien d’autre.",
				"giphyIds": [],
				"giphyQuery": "potato chips"
			},
			"b": {
				"name": "Chips au paprika",
				"origin": "Le paquet rouge",
				"line": "Les doigts orange, et la satisfaction.",
				"giphyIds": [],
				"giphyQuery": "paprika chips"
			}
		},
		{
			"id": "bouffe-pop-corn-sucre-pop-corn-sale",
			"category": "bouffe",
			"a": {
				"name": "Pop-corn sucré",
				"origin": "Le cinéma",
				"line": "Caramélisé, et collé aux dents.",
				"giphyIds": [],
				"giphyQuery": "caramel popcorn"
			},
			"b": {
				"name": "Pop-corn salé",
				"origin": "Le cinéma aussi",
				"line": "Beurré, et collé aux doigts.",
				"giphyIds": [],
				"giphyQuery": "salted popcorn"
			}
		},
		{
			"id": "bouffe-cereales-d-abord-lait-d-abord",
			"category": "bouffe",
			"question": "Dans le bol : les céréales ou le lait d’abord ?",
			"a": {
				"name": "Céréales d’abord",
				"origin": "Le bol",
				"line": "Les céréales, puis le lait. Normal.",
				"giphyIds": [],
				"giphyQuery": "cereal pouring"
			},
			"b": {
				"name": "Lait d’abord",
				"origin": "Le bol aussi",
				"line": "Le lait, puis les céréales. Rebelle.",
				"giphyIds": [],
				"giphyQuery": "milk pouring"
			}
		},
		{
			"id": "bouffe-pates-al-dente-pates-bien-cuites",
			"category": "bouffe",
			"a": {
				"name": "Pâtes al dente",
				"origin": "L’Italie",
				"line": "Fermes sous la dent, comme il faut.",
				"giphyIds": [],
				"giphyQuery": "al dente pasta"
			},
			"b": {
				"name": "Pâtes bien cuites",
				"origin": "La cantine",
				"line": "Fondantes, et un peu collées.",
				"giphyIds": [],
				"giphyQuery": "overcooked pasta"
			}
		},
		{
			"id": "bouffe-croque-monsieur-croque-madame",
			"category": "bouffe",
			"a": {
				"name": "Croque-monsieur",
				"origin": "Le café",
				"line": "Jambon, fromage, et pain grillé.",
				"giphyIds": [],
				"giphyQuery": "croque monsieur"
			},
			"b": {
				"name": "Croque-madame",
				"origin": "Le café aussi",
				"line": "Le même, avec un œuf au plat dessus.",
				"giphyIds": [],
				"giphyQuery": "croque madame"
			}
		},
		{
			"id": "bouffe-tartiflette-aligot",
			"category": "bouffe",
			"a": {
				"name": "Tartiflette",
				"origin": "La Savoie",
				"line": "Reblochon, pommes de terre, lardons, et sieste.",
				"giphyIds": [],
				"giphyQuery": "tartiflette"
			},
			"b": {
				"name": "Aligot",
				"origin": "L’Aubrac",
				"line": "Une purée qui file sur un mètre.",
				"giphyIds": [],
				"giphyQuery": "aligot cheese pull"
			}
		},
		{
			"id": "bouffe-cassoulet-choucroute",
			"category": "bouffe",
			"a": {
				"name": "Cassoulet",
				"origin": "Castelnaudary",
				"line": "Haricots, saucisse, confit, et du temps.",
				"giphyIds": [],
				"giphyQuery": "cassoulet"
			},
			"b": {
				"name": "Choucroute",
				"origin": "L’Alsace",
				"line": "Chou, saucisses, et bière.",
				"giphyIds": [],
				"giphyQuery": "choucroute"
			}
		},
		{
			"id": "bouffe-bouillabaisse-moules-frites",
			"category": "bouffe",
			"a": {
				"name": "Bouillabaisse",
				"origin": "Marseille",
				"line": "Des poissons, de la rouille, et des croûtons.",
				"giphyIds": [],
				"giphyQuery": "bouillabaisse"
			},
			"b": {
				"name": "Moules-frites",
				"origin": "La Belgique et le Nord",
				"line": "Une montagne de moules, et des frites à côté.",
				"giphyIds": [],
				"giphyQuery": "mussels and fries"
			}
		},
		{
			"id": "bouffe-ratatouille-couscous",
			"category": "bouffe",
			"a": {
				"name": "Ratatouille",
				"origin": "La Provence",
				"line": "Des légumes du soleil, mijotés longtemps.",
				"giphyIds": [],
				"giphyQuery": "ratatouille dish"
			},
			"b": {
				"name": "Couscous",
				"origin": "Le Maghreb",
				"line": "La semoule, les légumes, et la famille autour.",
				"giphyIds": [],
				"giphyQuery": "couscous"
			}
		},
		{
			"id": "bouffe-kouign-amann-far-breton",
			"category": "bouffe",
			"a": {
				"name": "Kouign-amann",
				"origin": "La Bretagne",
				"line": "Du beurre, du sucre, et encore du beurre.",
				"giphyIds": [],
				"giphyQuery": "kouign amann"
			},
			"b": {
				"name": "Far breton",
				"origin": "La Bretagne aussi",
				"line": "Des pruneaux, ou pas, selon la famille.",
				"giphyIds": [],
				"giphyQuery": "far breton"
			}
		},
		{
			"id": "bouffe-beurre-doux-beurre-sale",
			"category": "bouffe",
			"a": {
				"name": "Beurre doux",
				"origin": "Le nord de la Loire",
				"line": "Doux, et sans débat. Enfin presque.",
				"giphyIds": [],
				"giphyQuery": "butter"
			},
			"b": {
				"name": "Beurre salé",
				"origin": "La Bretagne",
				"line": "Il y a du sel. Évidemment.",
				"giphyIds": [],
				"giphyQuery": "salted butter"
			}
		},
		{
			"id": "bouffe-eau-plate-eau-gazeuse",
			"category": "bouffe",
			"a": {
				"name": "Eau plate",
				"origin": "La carafe",
				"line": "Simple, et parfaite.",
				"giphyIds": [],
				"giphyQuery": "water glass"
			},
			"b": {
				"name": "Eau gazeuse",
				"origin": "La bouteille verte",
				"line": "Des bulles, même sans fête.",
				"giphyIds": [],
				"giphyQuery": "sparkling water"
			}
		},
		{
			"id": "bouffe-jus-d-orange-avec-pulpe-jus-d-orange-sans-pulpe",
			"category": "bouffe",
			"a": {
				"name": "Jus d’orange avec pulpe",
				"origin": "La bouteille",
				"line": "Des morceaux, et de la texture.",
				"giphyIds": [],
				"giphyQuery": "orange juice pulp"
			},
			"b": {
				"name": "Jus d’orange sans pulpe",
				"origin": "La bouteille aussi",
				"line": "Lisse, et rien qui accroche.",
				"giphyIds": [],
				"giphyQuery": "orange juice"
			}
		},
		{
			"id": "bouffe-fraise-framboise",
			"category": "bouffe",
			"a": {
				"name": "Fraise",
				"origin": "Le jardin",
				"line": "Rouge, sucrée, et la Chantilly.",
				"giphyIds": [],
				"giphyQuery": "strawberries"
			},
			"b": {
				"name": "Framboise",
				"origin": "La haie",
				"line": "Petite, acidulée, et sur les doigts.",
				"giphyIds": [],
				"giphyQuery": "raspberries"
			}
		},
		{
			"id": "bouffe-banane-verte-banane-bien-mure",
			"category": "bouffe",
			"a": {
				"name": "Banane verte",
				"origin": "Le régime",
				"line": "Ferme, un peu acide, et ça croque.",
				"giphyIds": [],
				"giphyQuery": "green banana"
			},
			"b": {
				"name": "Banane bien mûre",
				"origin": "La corbeille",
				"line": "Tachetée, sucrée, et fondante.",
				"giphyIds": [],
				"giphyQuery": "ripe banana"
			}
		},
		{
			"id": "bouffe-chantilly-creme-anglaise",
			"category": "bouffe",
			"a": {
				"name": "Chantilly",
				"origin": "Le siphon",
				"line": "Légère, sucrée, et sur tout.",
				"giphyIds": [],
				"giphyQuery": "whipped cream"
			},
			"b": {
				"name": "Crème anglaise",
				"origin": "La casserole",
				"line": "Vanillée, et sur le gâteau au chocolat.",
				"giphyIds": [],
				"giphyQuery": "custard sauce"
			}
		},
		{
			"id": "geek-python-javascript",
			"category": "geek",
			"a": {
				"name": "Python",
				"origin": "Guido van Rossum · 1991",
				"line": "Lisible, indenté, et un serpent sur le logo.",
				"giphyIds": [],
				"giphyQuery": "Python programming"
			},
			"b": {
				"name": "JavaScript",
				"origin": "Brendan Eich · 1995",
				"line": "Écrit en dix jours, utilisé partout.",
				"giphyIds": [],
				"giphyQuery": "JavaScript code"
			}
		},
		{
			"id": "geek-front-end-back-end",
			"category": "geek",
			"a": {
				"name": "Front-end",
				"origin": "Le navigateur",
				"line": "Des boutons, des couleurs, et un pixel de travers.",
				"giphyIds": [],
				"giphyQuery": "web design"
			},
			"b": {
				"name": "Back-end",
				"origin": "Le serveur",
				"line": "Des bases de données, et personne ne voit ton travail.",
				"giphyIds": [],
				"giphyQuery": "server room"
			}
		},
		{
			"id": "geek-clavier-mecanique-clavier-silencieux",
			"category": "geek",
			"a": {
				"name": "Clavier mécanique",
				"origin": "Le bureau",
				"line": "Clic, clac, et les collègues qui soupirent.",
				"giphyIds": [],
				"giphyQuery": "mechanical keyboard"
			},
			"b": {
				"name": "Clavier silencieux",
				"origin": "Le bureau aussi",
				"line": "On tape, et personne ne s’en aperçoit.",
				"giphyIds": [],
				"giphyQuery": "quiet keyboard typing"
			}
		},
		{
			"id": "geek-souris-pave-tactile",
			"category": "geek",
			"a": {
				"name": "Souris",
				"origin": "Le tapis",
				"line": "Précise, et une molette pour défiler.",
				"giphyIds": [],
				"giphyQuery": "computer mouse"
			},
			"b": {
				"name": "Pavé tactile",
				"origin": "L’ordinateur portable",
				"line": "Deux doigts, et ça zoome quand on ne veut pas.",
				"giphyIds": [],
				"giphyQuery": "trackpad"
			}
		},
		{
			"id": "geek-un-ecran-trois-ecrans",
			"category": "geek",
			"a": {
				"name": "Un écran",
				"origin": "Le bureau",
				"line": "Une fenêtre à la fois, et la concentration.",
				"giphyIds": [],
				"giphyQuery": "single monitor"
			},
			"b": {
				"name": "Trois écrans",
				"origin": "Le bureau de rêve",
				"line": "Le code, le navigateur, et une vidéo de chats.",
				"giphyIds": [],
				"giphyQuery": "multiple monitors setup"
			}
		},
		{
			"id": "geek-dune-fondation",
			"category": "geek",
			"a": {
				"name": "Dune",
				"origin": "Frank Herbert · 1965",
				"line": "Du sable, des vers géants, et l’épice.",
				"giphyIds": [],
				"giphyQuery": "Dune sandworm"
			},
			"b": {
				"name": "Fondation",
				"origin": "Isaac Asimov · 1951",
				"line": "Prévoir l’avenir de la galaxie, avec des maths.",
				"giphyIds": [],
				"giphyQuery": "Foundation Asimov"
			}
		},
		{
			"id": "geek-blade-runner-matrix",
			"category": "geek",
			"a": {
				"name": "Blade Runner",
				"origin": "Ridley Scott · 1982",
				"line": "Des androïdes, la pluie, et des néons.",
				"giphyIds": [],
				"giphyQuery": "Blade Runner"
			},
			"b": {
				"name": "Matrix",
				"origin": "Les Wachowski · 1999",
				"line": "Des lignes de code vertes, et un monde qui n’existe pas.",
				"giphyIds": [],
				"giphyQuery": "Matrix code"
			}
		},
		{
			"id": "geek-hal-9000-skynet",
			"category": "geek",
			"a": {
				"name": "HAL 9000",
				"origin": "2001, l’odyssée de l’espace · 1968",
				"line": "« Je suis désolé, Dave. »",
				"giphyIds": [],
				"giphyQuery": "HAL 9000"
			},
			"b": {
				"name": "Skynet",
				"origin": "Terminator · 1984",
				"line": "Le pire projet d’IA de l’histoire, livré en avance.",
				"giphyIds": [],
				"giphyQuery": "Skynet Terminator"
			}
		},
		{
			"id": "geek-code-commente-code-qui-s-explique-tout-seul",
			"category": "geek",
			"a": {
				"name": "Code commenté",
				"origin": "Le dépôt",
				"line": "Chaque ligne a son explication.",
				"giphyIds": [],
				"giphyQuery": "commented code"
			},
			"b": {
				"name": "Code qui s’explique tout seul",
				"origin": "Le dépôt aussi",
				"line": "« Le code, c’est la documentation. » Bien sûr.",
				"giphyIds": [],
				"giphyQuery": "confusing code"
			}
		},
		{
			"id": "geek-tests-unitaires-tester-en-production",
			"category": "geek",
			"a": {
				"name": "Tests unitaires",
				"origin": "La CI",
				"line": "Rien ne part en production sans être vérifié.",
				"giphyIds": [],
				"giphyQuery": "tests passing"
			},
			"b": {
				"name": "Tester en production",
				"origin": "Le vendredi soir",
				"line": "Courageux, et un peu fou.",
				"giphyIds": [],
				"giphyQuery": "this is fine fire"
			}
		},
		{
			"id": "geek-cafe-boisson-energisante",
			"category": "geek",
			"a": {
				"name": "Café",
				"origin": "La machine",
				"line": "Le carburant de tout développeur qui se respecte.",
				"giphyIds": [],
				"giphyQuery": "coffee programmer"
			},
			"b": {
				"name": "Boisson énergisante",
				"origin": "La canette",
				"line": "Les ailes, et le cœur qui bat un peu vite.",
				"giphyIds": [],
				"giphyQuery": "energy drink"
			}
		},
		{
			"id": "geek-stack-overflow-documentation-officielle",
			"category": "geek",
			"a": {
				"name": "Stack Overflow",
				"origin": "Internet · 2008",
				"line": "Quelqu’un a déjà eu ton bug en 2011.",
				"giphyIds": [],
				"giphyQuery": "Stack Overflow"
			},
			"b": {
				"name": "Documentation officielle",
				"origin": "Le site du projet",
				"line": "La réponse est dedans. Quelque part.",
				"giphyIds": [],
				"giphyQuery": "reading documentation"
			}
		},
		{
			"id": "geek-git-en-ligne-de-commande-git-avec-interface",
			"category": "geek",
			"a": {
				"name": "Git en ligne de commande",
				"origin": "Le terminal",
				"line": "Puissant, précis, et un peu effrayant.",
				"giphyIds": [],
				"giphyQuery": "terminal hacker"
			},
			"b": {
				"name": "Git avec interface",
				"origin": "L’éditeur",
				"line": "Des boutons, des couleurs, et moins de sueurs froides.",
				"giphyIds": [],
				"giphyQuery": "git gui"
			}
		},
		{
			"id": "geek-bureau-propre-bureau-sature",
			"category": "geek",
			"a": {
				"name": "Bureau propre",
				"origin": "L’écran d’accueil",
				"line": "Trois icônes et un joli fond d’écran.",
				"giphyIds": [],
				"giphyQuery": "clean desktop"
			},
			"b": {
				"name": "Bureau saturé",
				"origin": "L’écran d’accueil aussi",
				"line": "Quatre cents icônes, et tu sais où est chacune.",
				"giphyIds": [],
				"giphyQuery": "messy desktop icons"
			}
		},
		{
			"id": "geek-fichiers-ranges-tout-dans-telechargements",
			"category": "geek",
			"a": {
				"name": "Fichiers rangés",
				"origin": "Les dossiers",
				"line": "Un dossier par projet, un sous-dossier par année.",
				"giphyIds": [],
				"giphyQuery": "organized folders"
			},
			"b": {
				"name": "Tout dans Téléchargements",
				"origin": "Le dossier Téléchargements",
				"line": "Quatre mille fichiers, dont « document (37).pdf ».",
				"giphyIds": [],
				"giphyQuery": "downloads folder mess"
			}
		},
		{
			"id": "geek-meme-mot-de-passe-partout-gestionnaire-de-mots-de-passe",
			"category": "geek",
			"a": {
				"name": "Même mot de passe partout",
				"origin": "Ta mémoire",
				"line": "Facile à retenir. Facile à pirater aussi.",
				"giphyIds": [],
				"giphyQuery": "password 123456"
			},
			"b": {
				"name": "Gestionnaire de mots de passe",
				"origin": "Le coffre-fort",
				"line": "Un seul mot de passe, et tous les autres impossibles.",
				"giphyIds": [],
				"giphyQuery": "password manager"
			}
		},
		{
			"id": "geek-redemarrer-chercher-le-bug",
			"category": "geek",
			"a": {
				"name": "Redémarrer",
				"origin": "Le bouton",
				"line": "« Tu as essayé de l’éteindre et de le rallumer ? »",
				"giphyIds": [],
				"giphyQuery": "IT Crowd turn it off"
			},
			"b": {
				"name": "Chercher le bug",
				"origin": "La console",
				"line": "Trois heures, pour un point-virgule.",
				"giphyIds": [],
				"giphyQuery": "debugging"
			}
		},
		{
			"id": "geek-ordinateur-portable-ordinateur-fixe",
			"category": "geek",
			"a": {
				"name": "Ordinateur portable",
				"origin": "Le sac",
				"line": "Partout avec toi, et le dos qui en souffre.",
				"giphyIds": [],
				"giphyQuery": "laptop"
			},
			"b": {
				"name": "Ordinateur fixe",
				"origin": "Le bureau",
				"line": "Puissant, évolutif, et il ne bouge pas.",
				"giphyIds": [],
				"giphyQuery": "desktop computer"
			}
		},
		{
			"id": "geek-ecran-classique-ecran-ultra-large",
			"category": "geek",
			"a": {
				"name": "Écran classique",
				"origin": "Le format 16:9",
				"line": "Le standard, et ça suffit.",
				"giphyIds": [],
				"giphyQuery": "computer monitor"
			},
			"b": {
				"name": "Écran ultra-large",
				"origin": "Le format 21:9",
				"line": "Tu tournes la tête pour lire.",
				"giphyIds": [],
				"giphyQuery": "ultrawide monitor"
			}
		},
		{
			"id": "geek-nintendo-switch-steam-deck",
			"category": "geek",
			"a": {
				"name": "Nintendo Switch",
				"origin": "Nintendo · 2017",
				"line": "Sur la télé, ou dans le train.",
				"giphyIds": [],
				"giphyQuery": "Nintendo Switch"
			},
			"b": {
				"name": "Steam Deck",
				"origin": "Valve · 2022",
				"line": "Ta bibliothèque Steam, dans les mains.",
				"giphyIds": [],
				"giphyQuery": "Steam Deck"
			}
		},
		{
			"id": "geek-raspberry-pi-arduino",
			"category": "geek",
			"a": {
				"name": "Raspberry Pi",
				"origin": "Royaume-Uni · 2012",
				"line": "Un ordinateur grand comme une carte de crédit.",
				"giphyIds": [],
				"giphyQuery": "Raspberry Pi"
			},
			"b": {
				"name": "Arduino",
				"origin": "Italie · 2005",
				"line": "Des LED qui clignotent, et beaucoup de fierté.",
				"giphyIds": [],
				"giphyQuery": "Arduino LED"
			}
		},
		{
			"id": "geek-lego-technic-meccano",
			"category": "geek",
			"a": {
				"name": "Lego Technic",
				"origin": "Lego · 1977",
				"line": "Des engrenages, des pistons, et la notice de 400 pages.",
				"giphyIds": [],
				"giphyQuery": "Lego Technic"
			},
			"b": {
				"name": "Meccano",
				"origin": "Royaume-Uni · 1898",
				"line": "Des plaques percées, des vis, et un petit tournevis.",
				"giphyIds": [],
				"giphyQuery": "Meccano"
			}
		},
		{
			"id": "geek-donjons-et-dragons-catan",
			"category": "geek",
			"a": {
				"name": "Donjons et Dragons",
				"origin": "TSR · 1974",
				"line": "Des dés à vingt faces, et des soirées entières.",
				"giphyIds": [],
				"giphyQuery": "Dungeons and Dragons dice"
			},
			"b": {
				"name": "Catan",
				"origin": "Allemagne · 1995",
				"line": "« J’échange un mouton contre du bois. »",
				"giphyIds": [],
				"giphyQuery": "Catan board game"
			}
		},
		{
			"id": "geek-warhammer-magic-l-assemblee",
			"category": "geek",
			"a": {
				"name": "Warhammer",
				"origin": "Games Workshop · 1983",
				"line": "Des figurines à peindre, une à une, pendant des années.",
				"giphyIds": [],
				"giphyQuery": "Warhammer miniatures"
			},
			"b": {
				"name": "Magic : l’Assemblée",
				"origin": "Wizards of the Coast · 1993",
				"line": "Des cartes, des sorts, et un budget qui fond.",
				"giphyIds": [],
				"giphyQuery": "Magic the Gathering cards"
			}
		},
		{
			"id": "geek-japan-expo-comic-con",
			"category": "geek",
			"a": {
				"name": "Japan Expo",
				"origin": "Paris · 1999",
				"line": "Des cosplays, des mangas, et des files d’attente.",
				"giphyIds": [],
				"giphyQuery": "cosplay convention"
			},
			"b": {
				"name": "Comic Con",
				"origin": "San Diego · 1970",
				"line": "Des super-héros, des annonces, et encore des files.",
				"giphyIds": [],
				"giphyQuery": "Comic Con"
			}
		},
		{
			"id": "geek-manga-comics",
			"category": "geek",
			"a": {
				"name": "Manga",
				"origin": "Le Japon",
				"line": "Se lit de droite à gauche.",
				"giphyIds": [],
				"giphyQuery": "manga reading"
			},
			"b": {
				"name": "Comics",
				"origin": "Les États-Unis",
				"line": "Se lit de gauche à droite, en couleur.",
				"giphyIds": [],
				"giphyQuery": "comic book"
			}
		},
		{
			"id": "geek-vf-vostfr",
			"category": "geek",
			"question": "Les séries : en VF ou en VOSTFR ?",
			"a": {
				"name": "VF",
				"origin": "Le doublage",
				"line": "Les voix françaises que tout le monde connaît.",
				"giphyIds": [],
				"giphyQuery": "dubbing studio"
			},
			"b": {
				"name": "VOSTFR",
				"origin": "Les sous-titres",
				"line": "La vraie voix des acteurs, et lire très vite.",
				"giphyIds": [],
				"giphyQuery": "subtitles"
			}
		},
		{
			"id": "geek-binge-watching-un-episode-par-semaine",
			"category": "geek",
			"a": {
				"name": "Binge-watching",
				"origin": "Le week-end",
				"line": "Une saison entière en deux jours.",
				"giphyIds": [],
				"giphyQuery": "binge watching"
			},
			"b": {
				"name": "Un épisode par semaine",
				"origin": "Le mardi soir",
				"line": "L’attente, et le plaisir de l’attente.",
				"giphyIds": [],
				"giphyQuery": "waiting for episode"
			}
		},
		{
			"id": "geek-lire-les-spoilers-fuir-les-spoilers",
			"category": "geek",
			"a": {
				"name": "Lire les spoilers",
				"origin": "Internet",
				"line": "Savoir la fin, et regarder quand même.",
				"giphyIds": [],
				"giphyQuery": "spoiler alert"
			},
			"b": {
				"name": "Fuir les spoilers",
				"origin": "Internet aussi",
				"line": "Couper les réseaux, et les doigts dans les oreilles.",
				"giphyIds": [],
				"giphyQuery": "covering ears"
			}
		},
		{
			"id": "geek-enceinte-connectee-interrupteur",
			"category": "geek",
			"a": {
				"name": "Enceinte connectée",
				"origin": "Le salon",
				"line": "« Allume la lumière. » « Je n’ai pas compris. »",
				"giphyIds": [],
				"giphyQuery": "smart speaker"
			},
			"b": {
				"name": "Interrupteur",
				"origin": "Le mur",
				"line": "Un clic, la lumière. Infaillible.",
				"giphyIds": [],
				"giphyQuery": "light switch"
			}
		},
		{
			"id": "geek-robot-aspirateur-balai",
			"category": "geek",
			"a": {
				"name": "Robot aspirateur",
				"origin": "Le salon",
				"line": "Il nettoie tout seul, et se coince sous le canapé.",
				"giphyIds": [],
				"giphyQuery": "robot vacuum cat"
			},
			"b": {
				"name": "Balai",
				"origin": "Le placard",
				"line": "Il nettoie, si tu t’en sers.",
				"giphyIds": [],
				"giphyQuery": "broom sweeping"
			}
		},
		{
			"id": "geek-cloud-disque-dur-externe",
			"category": "geek",
			"a": {
				"name": "Cloud",
				"origin": "Internet",
				"line": "Tes fichiers partout, et nulle part en même temps.",
				"giphyIds": [],
				"giphyQuery": "cloud storage"
			},
			"b": {
				"name": "Disque dur externe",
				"origin": "Le tiroir",
				"line": "Tes fichiers dans ta main, et tu ne sais plus lequel.",
				"giphyIds": [],
				"giphyQuery": "external hard drive"
			}
		},
		{
			"id": "geek-mettre-a-jour-tout-de-suite-repousser-la-mise-a-jour",
			"category": "geek",
			"a": {
				"name": "Mettre à jour tout de suite",
				"origin": "La notification",
				"line": "Toujours la dernière version.",
				"giphyIds": [],
				"giphyQuery": "updating"
			},
			"b": {
				"name": "Repousser la mise à jour",
				"origin": "La notification aussi",
				"line": "« Me le rappeler demain. » Depuis 2019.",
				"giphyIds": [],
				"giphyQuery": "remind me later"
			}
		},
		{
			"id": "geek-lire-le-mode-d-emploi-se-debrouiller",
			"category": "geek",
			"a": {
				"name": "Lire le mode d’emploi",
				"origin": "La boîte",
				"line": "Chaque étape, dans l’ordre.",
				"giphyIds": [],
				"giphyQuery": "reading manual"
			},
			"b": {
				"name": "Se débrouiller",
				"origin": "La boîte aussi",
				"line": "Il reste trois vis. Ce n’est pas grave.",
				"giphyIds": [],
				"giphyQuery": "leftover screws"
			}
		},
		{
			"id": "geek-ctrl-alt-suppr-debrancher-la-prise",
			"category": "geek",
			"a": {
				"name": "Ctrl+Alt+Suppr",
				"origin": "Le clavier",
				"line": "Le geste qui sauve les ordinateurs depuis des décennies.",
				"giphyIds": [],
				"giphyQuery": "ctrl alt delete"
			},
			"b": {
				"name": "Débrancher la prise",
				"origin": "Le mur",
				"line": "La méthode radicale.",
				"giphyIds": [],
				"giphyQuery": "unplugging"
			}
		},
		{
			"id": "geek-excel-google-sheets",
			"category": "geek",
			"a": {
				"name": "Excel",
				"origin": "Microsoft · 1985",
				"line": "Des formules, et des macros mystérieuses.",
				"giphyIds": [],
				"giphyQuery": "Excel spreadsheet"
			},
			"b": {
				"name": "Google Sheets",
				"origin": "Google · 2006",
				"line": "Le tableur à plusieurs, en direct.",
				"giphyIds": [],
				"giphyQuery": "Google Sheets"
			}
		},
		{
			"id": "jeux-salameche-carapuce",
			"category": "jeux",
			"a": {
				"name": "Salamèche",
				"origin": "Pokémon · 1996",
				"line": "Une flamme au bout de la queue.",
				"giphyIds": [],
				"giphyQuery": "Charmander"
			},
			"b": {
				"name": "Carapuce",
				"origin": "Pokémon · 1996",
				"line": "Une carapace, et des lunettes de soleil dans l’anime.",
				"giphyIds": [],
				"giphyQuery": "Squirtle"
			}
		},
		{
			"id": "jeux-pokemon-rouge-pokemon-bleu",
			"category": "jeux",
			"a": {
				"name": "Pokémon Rouge",
				"origin": "Game Boy · 1996",
				"line": "Dracaufeu sur la boîte.",
				"giphyIds": [],
				"giphyQuery": "Pokemon Red"
			},
			"b": {
				"name": "Pokémon Bleu",
				"origin": "Game Boy · 1996",
				"line": "Tortank sur la boîte.",
				"giphyIds": [],
				"giphyQuery": "Pokemon Blue"
			}
		},
		{
			"id": "jeux-fortnite-pubg",
			"category": "jeux",
			"a": {
				"name": "Fortnite",
				"origin": "Epic Games · 2017",
				"line": "Construire un mur, puis danser.",
				"giphyIds": [],
				"giphyQuery": "Fortnite dance"
			},
			"b": {
				"name": "PUBG",
				"origin": "Krafton · 2017",
				"line": "Cent joueurs, une île, et une poêle à frire.",
				"giphyIds": [],
				"giphyQuery": "PUBG pan"
			}
		},
		{
			"id": "jeux-call-of-duty-battlefield",
			"category": "jeux",
			"a": {
				"name": "Call of Duty",
				"origin": "Activision · 2003",
				"line": "Un nouvel épisode chaque année.",
				"giphyIds": [],
				"giphyQuery": "Call of Duty"
			},
			"b": {
				"name": "Battlefield",
				"origin": "DICE · 2002",
				"line": "Des chars, des avions, et tout qui s’effondre.",
				"giphyIds": [],
				"giphyQuery": "Battlefield explosion"
			}
		},
		{
			"id": "jeux-ea-sports-fc-efootball",
			"category": "jeux",
			"a": {
				"name": "EA Sports FC",
				"origin": "EA · 1993",
				"line": "Le jeu de foot, avec toutes les licences.",
				"giphyIds": [],
				"giphyQuery": "FIFA game goal"
			},
			"b": {
				"name": "eFootball",
				"origin": "Konami · 1995",
				"line": "L’éternel rival, avec des noms parfois inventés.",
				"giphyIds": [],
				"giphyQuery": "PES soccer game"
			}
		},
		{
			"id": "jeux-league-of-legends-dota-2",
			"category": "jeux",
			"a": {
				"name": "League of Legends",
				"origin": "Riot Games · 2009",
				"line": "Cinq contre cinq, et un chat toxique.",
				"giphyIds": [],
				"giphyQuery": "League of Legends"
			},
			"b": {
				"name": "Dota 2",
				"origin": "Valve · 2013",
				"line": "Cinq contre cinq aussi, et plus compliqué.",
				"giphyIds": [],
				"giphyQuery": "Dota 2"
			}
		},
		{
			"id": "jeux-world-of-warcraft-final-fantasy-xiv",
			"category": "jeux",
			"a": {
				"name": "World of Warcraft",
				"origin": "Blizzard · 2004",
				"line": "Des raids, des guildes, et des nuits blanches.",
				"giphyIds": [],
				"giphyQuery": "World of Warcraft"
			},
			"b": {
				"name": "Final Fantasy XIV",
				"origin": "Square Enix · 2013",
				"line": "Une renaissance spectaculaire, et des Chocobos.",
				"giphyIds": [],
				"giphyQuery": "Final Fantasy XIV"
			}
		},
		{
			"id": "jeux-the-witcher-3-skyrim",
			"category": "jeux",
			"a": {
				"name": "The Witcher 3",
				"origin": "CD Projekt · 2015",
				"line": "Un sorceleur, des contrats, et une partie de cartes.",
				"giphyIds": [],
				"giphyQuery": "Geralt Witcher"
			},
			"b": {
				"name": "Skyrim",
				"origin": "Bethesda · 2011",
				"line": "Des dragons, et une flèche dans le genou.",
				"giphyIds": [],
				"giphyQuery": "Skyrim arrow knee"
			}
		},
		{
			"id": "jeux-elden-ring-dark-souls",
			"category": "jeux",
			"a": {
				"name": "Elden Ring",
				"origin": "FromSoftware · 2022",
				"line": "Un monde immense, et tu meurs souvent.",
				"giphyIds": [],
				"giphyQuery": "Elden Ring"
			},
			"b": {
				"name": "Dark Souls",
				"origin": "FromSoftware · 2011",
				"line": "« Vous êtes mort. » Encore.",
				"giphyIds": [],
				"giphyQuery": "Dark Souls you died"
			}
		},
		{
			"id": "jeux-gta-v-red-dead-redemption-2",
			"category": "jeux",
			"a": {
				"name": "GTA V",
				"origin": "Rockstar · 2013",
				"line": "Los Santos, et zéro respect du code de la route.",
				"giphyIds": [],
				"giphyQuery": "GTA V"
			},
			"b": {
				"name": "Red Dead Redemption 2",
				"origin": "Rockstar · 2018",
				"line": "Le Far West, un cheval, et beaucoup d’émotions.",
				"giphyIds": [],
				"giphyQuery": "Red Dead Redemption 2"
			}
		},
		{
			"id": "jeux-breath-of-the-wild-ocarina-of-time",
			"category": "jeux",
			"a": {
				"name": "Breath of the Wild",
				"origin": "Nintendo · 2017",
				"line": "Un monde ouvert, et des armes qui cassent.",
				"giphyIds": [],
				"giphyQuery": "Breath of the Wild"
			},
			"b": {
				"name": "Ocarina of Time",
				"origin": "Nintendo · 1998",
				"line": "Une ocarina, et le temple de l’Eau.",
				"giphyIds": [],
				"giphyQuery": "Ocarina of Time"
			}
		},
		{
			"id": "jeux-halo-doom",
			"category": "jeux",
			"a": {
				"name": "Halo",
				"origin": "Bungie · 2001",
				"line": "Master Chief, et des guerres de clans.",
				"giphyIds": [],
				"giphyQuery": "Halo Master Chief"
			},
			"b": {
				"name": "Doom",
				"origin": "id Software · 1993",
				"line": "Une tronçonneuse, et l’enfer en personne.",
				"giphyIds": [],
				"giphyQuery": "Doom game"
			}
		},
		{
			"id": "jeux-overwatch-valorant",
			"category": "jeux",
			"a": {
				"name": "Overwatch",
				"origin": "Blizzard · 2016",
				"line": "Des héros, des pouvoirs, et une équipe.",
				"giphyIds": [],
				"giphyQuery": "Overwatch"
			},
			"b": {
				"name": "Valorant",
				"origin": "Riot Games · 2020",
				"line": "Des agents, des pouvoirs, et de la précision.",
				"giphyIds": [],
				"giphyQuery": "Valorant"
			}
		},
		{
			"id": "jeux-animal-crossing-stardew-valley",
			"category": "jeux",
			"a": {
				"name": "Animal Crossing",
				"origin": "Nintendo · 2001",
				"line": "Une île, des voisins animaux, et un crédit immobilier.",
				"giphyIds": [],
				"giphyQuery": "Animal Crossing Tom Nook"
			},
			"b": {
				"name": "Stardew Valley",
				"origin": "ConcernedApe · 2016",
				"line": "Une ferme, des légumes, et un village attachant.",
				"giphyIds": [],
				"giphyQuery": "Stardew Valley"
			}
		},
		{
			"id": "jeux-kirby-yoshi",
			"category": "jeux",
			"a": {
				"name": "Kirby",
				"origin": "Nintendo · 1992",
				"line": "Une boule rose qui avale tout.",
				"giphyIds": [],
				"giphyQuery": "Kirby"
			},
			"b": {
				"name": "Yoshi",
				"origin": "Nintendo · 1990",
				"line": "Un dinosaure vert qui avale tout aussi.",
				"giphyIds": [],
				"giphyQuery": "Yoshi"
			}
		},
		{
			"id": "jeux-donkey-kong-diddy-kong",
			"category": "jeux",
			"a": {
				"name": "Donkey Kong",
				"origin": "Nintendo · 1981",
				"line": "Une cravate, des bananes, et des tonneaux.",
				"giphyIds": [],
				"giphyQuery": "Donkey Kong"
			},
			"b": {
				"name": "Diddy Kong",
				"origin": "Nintendo · 1994",
				"line": "Une casquette rouge, et des cacahuètes.",
				"giphyIds": [],
				"giphyQuery": "Diddy Kong"
			}
		},
		{
			"id": "jeux-peach-daisy",
			"category": "jeux",
			"a": {
				"name": "Peach",
				"origin": "Nintendo · 1985",
				"line": "Toujours enlevée, jamais découragée.",
				"giphyIds": [],
				"giphyQuery": "Princess Peach"
			},
			"b": {
				"name": "Daisy",
				"origin": "Nintendo · 1989",
				"line": "« Hi, I’m Daisy ! »",
				"giphyIds": [],
				"giphyQuery": "Princess Daisy"
			}
		},
		{
			"id": "jeux-wario-waluigi",
			"category": "jeux",
			"a": {
				"name": "Wario",
				"origin": "Nintendo · 1992",
				"line": "Une moustache en zigzag, et un amour de l’or.",
				"giphyIds": [],
				"giphyQuery": "Wario"
			},
			"b": {
				"name": "Waluigi",
				"origin": "Nintendo · 2000",
				"line": "Toujours là, jamais le héros.",
				"giphyIds": [],
				"giphyQuery": "Waluigi"
			}
		},
		{
			"id": "jeux-carapace-bleue-peau-de-banane",
			"category": "jeux",
			"question": "L’arme ultime de Mario Kart : carapace bleue ou banane ?",
			"a": {
				"name": "Carapace bleue",
				"origin": "Mario Kart",
				"line": "Elle vise le premier. Toujours.",
				"giphyIds": [],
				"giphyQuery": "blue shell Mario Kart"
			},
			"b": {
				"name": "Peau de banane",
				"origin": "Mario Kart",
				"line": "Posée au bon endroit, au bon moment.",
				"giphyIds": [],
				"giphyQuery": "banana Mario Kart"
			}
		},
		{
			"id": "jeux-rayman-prince-of-persia",
			"category": "jeux",
			"a": {
				"name": "Rayman",
				"origin": "Ubisoft · 1995",
				"line": "Sans bras ni jambes, et pourtant il frappe.",
				"giphyIds": [],
				"giphyQuery": "Rayman"
			},
			"b": {
				"name": "Prince of Persia",
				"origin": "Jordan Mechner · 1989",
				"line": "Des acrobaties, des pièges, et du sable du temps.",
				"giphyIds": [],
				"giphyQuery": "Prince of Persia"
			}
		},
		{
			"id": "jeux-assassin-s-creed-hitman",
			"category": "jeux",
			"a": {
				"name": "Assassin’s Creed",
				"origin": "Ubisoft · 2007",
				"line": "Une capuche, et le saut de la foi dans une charrette de foin.",
				"giphyIds": [],
				"giphyQuery": "Assassins Creed leap"
			},
			"b": {
				"name": "Hitman",
				"origin": "IO Interactive · 2000",
				"line": "Un crâne rasé, un code-barres, et mille déguisements.",
				"giphyIds": [],
				"giphyQuery": "Hitman Agent 47"
			}
		},
		{
			"id": "jeux-resident-evil-silent-hill",
			"category": "jeux",
			"a": {
				"name": "Resident Evil",
				"origin": "Capcom · 1996",
				"line": "Des zombies, un manoir, et des munitions rares.",
				"giphyIds": [],
				"giphyQuery": "Resident Evil"
			},
			"b": {
				"name": "Silent Hill",
				"origin": "Konami · 1999",
				"line": "Du brouillard, une radio qui grésille, et la peur.",
				"giphyIds": [],
				"giphyQuery": "Silent Hill fog"
			}
		},
		{
			"id": "jeux-metal-gear-solid-splinter-cell",
			"category": "jeux",
			"a": {
				"name": "Metal Gear Solid",
				"origin": "Konami · 1998",
				"line": "Un espion caché sous un carton.",
				"giphyIds": [],
				"giphyQuery": "Metal Gear Solid box"
			},
			"b": {
				"name": "Splinter Cell",
				"origin": "Ubisoft · 2002",
				"line": "Trois lumières vertes dans le noir.",
				"giphyIds": [],
				"giphyQuery": "Splinter Cell"
			}
		},
		{
			"id": "jeux-portal-half-life",
			"category": "jeux",
			"a": {
				"name": "Portal",
				"origin": "Valve · 2007",
				"line": "Un portail bleu, un portail orange, et un gâteau promis.",
				"giphyIds": [],
				"giphyQuery": "Portal"
			},
			"b": {
				"name": "Half-Life",
				"origin": "Valve · 1998",
				"line": "Un pied-de-biche, et pas un mot.",
				"giphyIds": [],
				"giphyQuery": "Half-Life crowbar"
			}
		},
		{
			"id": "jeux-rocket-league-trackmania",
			"category": "jeux",
			"a": {
				"name": "Rocket League",
				"origin": "Psyonix · 2015",
				"line": "Du football, avec des voitures.",
				"giphyIds": [],
				"giphyQuery": "Rocket League"
			},
			"b": {
				"name": "Trackmania",
				"origin": "Nadeo · 2003",
				"line": "Des loopings, et recommencer mille fois.",
				"giphyIds": [],
				"giphyQuery": "Trackmania"
			}
		},
		{
			"id": "jeux-guitar-hero-just-dance",
			"category": "jeux",
			"a": {
				"name": "Guitar Hero",
				"origin": "RedOctane · 2005",
				"line": "Une guitare en plastique, et des doigts agiles.",
				"giphyIds": [],
				"giphyQuery": "Guitar Hero"
			},
			"b": {
				"name": "Just Dance",
				"origin": "Ubisoft · 2009",
				"line": "Danser devant la télé, sans aucune honte.",
				"giphyIds": [],
				"giphyQuery": "Just Dance"
			}
		},
		{
			"id": "jeux-wii-sports-wii-fit",
			"category": "jeux",
			"a": {
				"name": "Wii Sports",
				"origin": "Nintendo · 2006",
				"line": "Du bowling dans le salon, et des télés cassées.",
				"giphyIds": [],
				"giphyQuery": "Wii Sports bowling"
			},
			"b": {
				"name": "Wii Fit",
				"origin": "Nintendo · 2007",
				"line": "Une planche, et une console qui juge ton poids.",
				"giphyIds": [],
				"giphyQuery": "Wii Fit"
			}
		},
		{
			"id": "jeux-candy-crush-angry-birds",
			"category": "jeux",
			"a": {
				"name": "Candy Crush",
				"origin": "King · 2012",
				"line": "Des bonbons alignés, et cinq vies seulement.",
				"giphyIds": [],
				"giphyQuery": "Candy Crush"
			},
			"b": {
				"name": "Angry Birds",
				"origin": "Rovio · 2009",
				"line": "Des oiseaux catapultés sur des cochons.",
				"giphyIds": [],
				"giphyQuery": "Angry Birds"
			}
		},
		{
			"id": "jeux-clash-of-clans-clash-royale",
			"category": "jeux",
			"a": {
				"name": "Clash of Clans",
				"origin": "Supercell · 2012",
				"line": "Un village, des barbares, et beaucoup d’attente.",
				"giphyIds": [],
				"giphyQuery": "Clash of Clans"
			},
			"b": {
				"name": "Clash Royale",
				"origin": "Supercell · 2016",
				"line": "Trois minutes, trois tours, et des émojis qui rient.",
				"giphyIds": [],
				"giphyQuery": "Clash Royale"
			}
		},
		{
			"id": "jeux-undertale-hollow-knight",
			"category": "jeux",
			"a": {
				"name": "Undertale",
				"origin": "Toby Fox · 2015",
				"line": "Un jeu où l’on peut épargner tout le monde.",
				"giphyIds": [],
				"giphyQuery": "Undertale"
			},
			"b": {
				"name": "Hollow Knight",
				"origin": "Team Cherry · 2017",
				"line": "Un petit chevalier, et un royaume d’insectes.",
				"giphyIds": [],
				"giphyQuery": "Hollow Knight"
			}
		},
		{
			"id": "jeux-celeste-cuphead",
			"category": "jeux",
			"a": {
				"name": "Celeste",
				"origin": "Maddy Thorson · 2018",
				"line": "Grimper une montagne, et mourir mille fois.",
				"giphyIds": [],
				"giphyQuery": "Celeste game"
			},
			"b": {
				"name": "Cuphead",
				"origin": "Studio MDHR · 2017",
				"line": "Un dessin animé des années 30, et des boss impossibles.",
				"giphyIds": [],
				"giphyQuery": "Cuphead"
			}
		},
		{
			"id": "jeux-tails-knuckles",
			"category": "jeux",
			"a": {
				"name": "Tails",
				"origin": "Sega · 1992",
				"line": "Un renard à deux queues qui vole.",
				"giphyIds": [],
				"giphyQuery": "Tails Sonic"
			},
			"b": {
				"name": "Knuckles",
				"origin": "Sega · 1994",
				"line": "Un échidné qui ne sourit pas.",
				"giphyIds": [],
				"giphyQuery": "Knuckles"
			}
		},
		{
			"id": "jeux-mewtwo-mew",
			"category": "jeux",
			"a": {
				"name": "Mewtwo",
				"origin": "Pokémon · 1996",
				"line": "Le Pokémon créé en laboratoire.",
				"giphyIds": [],
				"giphyQuery": "Mewtwo"
			},
			"b": {
				"name": "Mew",
				"origin": "Pokémon · 1996",
				"line": "Le Pokémon rose, caché sous un camion. Paraît-il.",
				"giphyIds": [],
				"giphyQuery": "Mew Pokemon"
			}
		},
		{
			"id": "jeux-cloud-sephiroth",
			"category": "jeux",
			"a": {
				"name": "Cloud",
				"origin": "Final Fantasy VII · 1997",
				"line": "Une épée immense, et des cheveux impossibles.",
				"giphyIds": [],
				"giphyQuery": "Cloud Strife"
			},
			"b": {
				"name": "Sephiroth",
				"origin": "Final Fantasy VII · 1997",
				"line": "Des cheveux argentés, et une seule aile.",
				"giphyIds": [],
				"giphyQuery": "Sephiroth"
			}
		},
		{
			"id": "jeux-master-chief-doomguy",
			"category": "jeux",
			"a": {
				"name": "Master Chief",
				"origin": "Halo · 2001",
				"line": "Un casque, une visière dorée, et peu de mots.",
				"giphyIds": [],
				"giphyQuery": "Master Chief"
			},
			"b": {
				"name": "Doomguy",
				"origin": "Doom · 1993",
				"line": "Un casque, et encore moins de mots.",
				"giphyIds": [],
				"giphyQuery": "Doomguy"
			}
		},
		{
			"id": "jeux-mode-facile-mode-difficile",
			"category": "jeux",
			"a": {
				"name": "Mode facile",
				"origin": "Le menu",
				"line": "Profiter de l’histoire, tranquillement.",
				"giphyIds": [],
				"giphyQuery": "easy mode"
			},
			"b": {
				"name": "Mode difficile",
				"origin": "Le menu aussi",
				"line": "Souffrir, et en être fier.",
				"giphyIds": [],
				"giphyQuery": "hard mode rage"
			}
		},
		{
			"id": "ecrans-breaking-bad-better-call-saul",
			"category": "ecrans",
			"a": {
				"name": "Breaking Bad",
				"origin": "AMC · 2008",
				"line": "Un prof de chimie qui tourne très mal.",
				"giphyIds": [],
				"giphyQuery": "Breaking Bad"
			},
			"b": {
				"name": "Better Call Saul",
				"origin": "AMC · 2015",
				"line": "Un avocat qui tourne mal aussi, plus lentement.",
				"giphyIds": [],
				"giphyQuery": "Better Call Saul"
			}
		},
		{
			"id": "ecrans-stranger-things-dark",
			"category": "ecrans",
			"a": {
				"name": "Stranger Things",
				"origin": "Netflix · 2016",
				"line": "Des vélos, des talkies-walkies, et un monde à l’envers.",
				"giphyIds": [],
				"giphyQuery": "Stranger Things"
			},
			"b": {
				"name": "Dark",
				"origin": "Netflix · 2017",
				"line": "Des voyages dans le temps, et un arbre généalogique impossible.",
				"giphyIds": [],
				"giphyQuery": "Dark Netflix"
			}
		},
		{
			"id": "ecrans-game-of-thrones-house-of-the-dragon",
			"category": "ecrans",
			"a": {
				"name": "Game of Thrones",
				"origin": "HBO · 2011",
				"line": "Des dragons, des trônes, et beaucoup de traîtrises.",
				"giphyIds": [],
				"giphyQuery": "Game of Thrones"
			},
			"b": {
				"name": "House of the Dragon",
				"origin": "HBO · 2022",
				"line": "Encore plus de dragons, deux siècles plus tôt.",
				"giphyIds": [],
				"giphyQuery": "House of the Dragon"
			}
		},
		{
			"id": "ecrans-sherlock-dr-house",
			"category": "ecrans",
			"a": {
				"name": "Sherlock",
				"origin": "BBC · 2010",
				"line": "Un détective moderne, et un manteau à col relevé.",
				"giphyIds": [],
				"giphyQuery": "Sherlock BBC"
			},
			"b": {
				"name": "Dr House",
				"origin": "Fox · 2004",
				"line": "Une canne, de l’ironie, et ce n’est jamais le lupus.",
				"giphyIds": [],
				"giphyQuery": "House MD"
			}
		},
		{
			"id": "ecrans-the-big-bang-theory-how-i-met-your-mother",
			"category": "ecrans",
			"a": {
				"name": "The Big Bang Theory",
				"origin": "CBS · 2007",
				"line": "Des physiciens, et la place de Sheldon sur le canapé.",
				"giphyIds": [],
				"giphyQuery": "Big Bang Theory"
			},
			"b": {
				"name": "How I Met Your Mother",
				"origin": "CBS · 2005",
				"line": "Neuf saisons pour rencontrer la mère.",
				"giphyIds": [],
				"giphyQuery": "How I Met Your Mother"
			}
		},
		{
			"id": "ecrans-lost-prison-break",
			"category": "ecrans",
			"a": {
				"name": "Lost",
				"origin": "ABC · 2004",
				"line": "Une île, un avion écrasé, et mille questions.",
				"giphyIds": [],
				"giphyQuery": "Lost tv show"
			},
			"b": {
				"name": "Prison Break",
				"origin": "Fox · 2005",
				"line": "Un plan d’évasion tatoué sur le corps.",
				"giphyIds": [],
				"giphyQuery": "Prison Break"
			}
		},
		{
			"id": "ecrans-la-casa-de-papel-squid-game",
			"category": "ecrans",
			"a": {
				"name": "La Casa de Papel",
				"origin": "Antena 3 · 2017",
				"line": "Des masques de Dalí, et le Professeur.",
				"giphyIds": [],
				"giphyQuery": "Money Heist"
			},
			"b": {
				"name": "Squid Game",
				"origin": "Netflix · 2021",
				"line": "Des jeux d’enfants, et des enjeux énormes.",
				"giphyIds": [],
				"giphyQuery": "Squid Game"
			}
		},
		{
			"id": "ecrans-le-parrain-scarface",
			"category": "ecrans",
			"a": {
				"name": "Le Parrain",
				"origin": "Francis Ford Coppola · 1972",
				"line": "« Je vais lui faire une offre qu’il ne pourra pas refuser. »",
				"giphyIds": [],
				"giphyQuery": "The Godfather"
			},
			"b": {
				"name": "Scarface",
				"origin": "Brian De Palma · 1983",
				"line": "« Le monde est à toi. »",
				"giphyIds": [],
				"giphyQuery": "Scarface"
			}
		},
		{
			"id": "ecrans-pulp-fiction-kill-bill",
			"category": "ecrans",
			"a": {
				"name": "Pulp Fiction",
				"origin": "Quentin Tarantino · 1994",
				"line": "Un twist de danse, et une mallette mystérieuse.",
				"giphyIds": [],
				"giphyQuery": "Pulp Fiction dance"
			},
			"b": {
				"name": "Kill Bill",
				"origin": "Quentin Tarantino · 2003",
				"line": "Une combinaison jaune, et un sabre.",
				"giphyIds": [],
				"giphyQuery": "Kill Bill"
			}
		},
		{
			"id": "ecrans-titanic-avatar",
			"category": "ecrans",
			"a": {
				"name": "Titanic",
				"origin": "James Cameron · 1997",
				"line": "« Je suis le roi du monde ! »",
				"giphyIds": [],
				"giphyQuery": "Titanic king of the world"
			},
			"b": {
				"name": "Avatar",
				"origin": "James Cameron · 2009",
				"line": "Une planète bleue, et des Na’vi.",
				"giphyIds": [],
				"giphyQuery": "Avatar movie"
			}
		},
		{
			"id": "ecrans-retour-vers-le-futur-sos-fantomes",
			"category": "ecrans",
			"a": {
				"name": "Retour vers le futur",
				"origin": "Robert Zemeckis · 1985",
				"line": "Une DeLorean, et 88 miles à l’heure.",
				"giphyIds": [],
				"giphyQuery": "Back to the Future"
			},
			"b": {
				"name": "SOS Fantômes",
				"origin": "Ivan Reitman · 1984",
				"line": "« Qui vous allez appeler ? »",
				"giphyIds": [],
				"giphyQuery": "Ghostbusters"
			}
		},
		{
			"id": "ecrans-les-goonies-e-t-l-extra-terrestre",
			"category": "ecrans",
			"a": {
				"name": "Les Goonies",
				"origin": "Richard Donner · 1985",
				"line": "Une carte au trésor, et une bande de copains.",
				"giphyIds": [],
				"giphyQuery": "The Goonies"
			},
			"b": {
				"name": "E.T. l’extra-terrestre",
				"origin": "Steven Spielberg · 1982",
				"line": "Un vélo, une lune, et un doigt lumineux.",
				"giphyIds": [],
				"giphyQuery": "ET bike moon"
			}
		},
		{
			"id": "ecrans-matrix-inception",
			"category": "ecrans",
			"a": {
				"name": "Matrix",
				"origin": "Les Wachowski · 1999",
				"line": "Esquiver les balles en se penchant en arrière.",
				"giphyIds": [],
				"giphyQuery": "Matrix dodge"
			},
			"b": {
				"name": "Inception",
				"origin": "Christopher Nolan · 2010",
				"line": "Un rêve dans un rêve, et une toupie.",
				"giphyIds": [],
				"giphyQuery": "Inception spinning top"
			}
		},
		{
			"id": "ecrans-interstellar-gravity",
			"category": "ecrans",
			"a": {
				"name": "Interstellar",
				"origin": "Christopher Nolan · 2014",
				"line": "Un trou noir, une bibliothèque, et des larmes.",
				"giphyIds": [],
				"giphyQuery": "Interstellar"
			},
			"b": {
				"name": "Gravity",
				"origin": "Alfonso Cuarón · 2013",
				"line": "Seule dans l’espace, et ça tourne.",
				"giphyIds": [],
				"giphyQuery": "Gravity movie"
			}
		},
		{
			"id": "ecrans-le-seigneur-des-anneaux-le-hobbit",
			"category": "ecrans",
			"a": {
				"name": "Le Seigneur des anneaux",
				"origin": "Peter Jackson · 2001",
				"line": "Trois films, et des fins à rallonge.",
				"giphyIds": [],
				"giphyQuery": "Lord of the Rings"
			},
			"b": {
				"name": "Le Hobbit",
				"origin": "Peter Jackson · 2012",
				"line": "Trois films, pour un seul livre.",
				"giphyIds": [],
				"giphyQuery": "The Hobbit"
			}
		},
		{
			"id": "ecrans-tom-cruise-keanu-reeves",
			"category": "ecrans",
			"a": {
				"name": "Tom Cruise",
				"origin": "Mission impossible · 1996",
				"line": "Il fait ses cascades lui-même, et il court beaucoup.",
				"giphyIds": [],
				"giphyQuery": "Tom Cruise running"
			},
			"b": {
				"name": "Keanu Reeves",
				"origin": "Matrix · 1999",
				"line": "Le plus gentil de Hollywood.",
				"giphyIds": [],
				"giphyQuery": "Keanu Reeves"
			}
		},
		{
			"id": "ecrans-leonardo-dicaprio-brad-pitt",
			"category": "ecrans",
			"a": {
				"name": "Leonardo DiCaprio",
				"origin": "Titanic · 1997",
				"line": "Un Oscar, enfin, après des années.",
				"giphyIds": [],
				"giphyQuery": "Leonardo DiCaprio"
			},
			"b": {
				"name": "Brad Pitt",
				"origin": "Fight Club · 1999",
				"line": "Le charme, et des cheveux impeccables.",
				"giphyIds": [],
				"giphyQuery": "Brad Pitt"
			}
		},
		{
			"id": "ecrans-meryl-streep-julia-roberts",
			"category": "ecrans",
			"a": {
				"name": "Meryl Streep",
				"origin": "Le Diable s’habille en Prada · 2006",
				"line": "Des dizaines de nominations aux Oscars.",
				"giphyIds": [],
				"giphyQuery": "Meryl Streep"
			},
			"b": {
				"name": "Julia Roberts",
				"origin": "Pretty Woman · 1990",
				"line": "Le sourire le plus célèbre du cinéma.",
				"giphyIds": [],
				"giphyQuery": "Julia Roberts"
			}
		},
		{
			"id": "ecrans-jim-carrey-robin-williams",
			"category": "ecrans",
			"a": {
				"name": "Jim Carrey",
				"origin": "The Mask · 1994",
				"line": "Un visage en caoutchouc, et mille grimaces.",
				"giphyIds": [],
				"giphyQuery": "Jim Carrey"
			},
			"b": {
				"name": "Robin Williams",
				"origin": "Mrs. Doubtfire · 1993",
				"line": "Toutes les voix, et un cœur immense.",
				"giphyIds": [],
				"giphyQuery": "Robin Williams"
			}
		},
		{
			"id": "ecrans-version-longue-version-cinema",
			"category": "ecrans",
			"a": {
				"name": "Version longue",
				"origin": "Le coffret",
				"line": "Toutes les scènes coupées, et trois heures de plus.",
				"giphyIds": [],
				"giphyQuery": "extended edition"
			},
			"b": {
				"name": "Version cinéma",
				"origin": "La salle",
				"line": "Le film tel qu’il est sorti, et l’heure de dormir.",
				"giphyIds": [],
				"giphyQuery": "movie theater"
			}
		},
		{
			"id": "ecrans-film-d-horreur-comedie-romantique",
			"category": "ecrans",
			"a": {
				"name": "Film d’horreur",
				"origin": "Le canapé, lumières éteintes",
				"line": "Des frissons, et un coussin devant les yeux.",
				"giphyIds": [],
				"giphyQuery": "horror movie scared"
			},
			"b": {
				"name": "Comédie romantique",
				"origin": "Le canapé, plaid compris",
				"line": "Des quiproquos, et un baiser sous la pluie.",
				"giphyIds": [],
				"giphyQuery": "romantic comedy"
			}
		},
		{
			"id": "ecrans-fin-heureuse-fin-ouverte",
			"category": "ecrans",
			"a": {
				"name": "Fin heureuse",
				"origin": "Le générique",
				"line": "Tout le monde s’embrasse, et ça fait du bien.",
				"giphyIds": [],
				"giphyQuery": "happy ending"
			},
			"b": {
				"name": "Fin ouverte",
				"origin": "Le générique aussi",
				"line": "Tu en parles encore trois jours après.",
				"giphyIds": [],
				"giphyQuery": "confused ending"
			}
		},
		{
			"id": "ecrans-regarder-la-bande-annonce-ne-rien-savoir",
			"category": "ecrans",
			"a": {
				"name": "Regarder la bande-annonce",
				"origin": "YouTube",
				"line": "Tu connais l’histoire avant d’entrer.",
				"giphyIds": [],
				"giphyQuery": "movie trailer"
			},
			"b": {
				"name": "Ne rien savoir",
				"origin": "La salle",
				"line": "La surprise totale, dès le début.",
				"giphyIds": [],
				"giphyQuery": "surprised audience"
			}
		},
		{
			"id": "ecrans-grey-s-anatomy-scrubs",
			"category": "ecrans",
			"a": {
				"name": "Grey’s Anatomy",
				"origin": "ABC · 2005",
				"line": "Des chirurgiens, et des histoires d’amour en salle de garde.",
				"giphyIds": [],
				"giphyQuery": "Greys Anatomy"
			},
			"b": {
				"name": "Scrubs",
				"origin": "NBC · 2001",
				"line": "Des internes, et des rêveries absurdes.",
				"giphyIds": [],
				"giphyQuery": "Scrubs tv"
			}
		},
		{
			"id": "ecrans-les-experts-ncis",
			"category": "ecrans",
			"a": {
				"name": "Les Experts",
				"origin": "CBS · 2000",
				"line": "Des lunettes de soleil, et des indices partout.",
				"giphyIds": [],
				"giphyQuery": "CSI Miami sunglasses"
			},
			"b": {
				"name": "NCIS",
				"origin": "CBS · 2003",
				"line": "Deux personnes qui tapent sur le même clavier.",
				"giphyIds": [],
				"giphyQuery": "NCIS keyboard"
			}
		},
		{
			"id": "ecrans-desperate-housewives-sex-and-the-city",
			"category": "ecrans",
			"a": {
				"name": "Desperate Housewives",
				"origin": "ABC · 2004",
				"line": "Une rue parfaite, et des secrets partout.",
				"giphyIds": [],
				"giphyQuery": "Desperate Housewives"
			},
			"b": {
				"name": "Sex and the City",
				"origin": "HBO · 1998",
				"line": "New York, des cocktails, et des chaussures.",
				"giphyIds": [],
				"giphyQuery": "Sex and the City"
			}
		},
		{
			"id": "ecrans-supernatural-the-walking-dead",
			"category": "ecrans",
			"a": {
				"name": "Supernatural",
				"origin": "The WB · 2005",
				"line": "Deux frères, une Impala, et des démons.",
				"giphyIds": [],
				"giphyQuery": "Supernatural tv"
			},
			"b": {
				"name": "The Walking Dead",
				"origin": "AMC · 2010",
				"line": "Des zombies, et des survivants qui se disputent.",
				"giphyIds": [],
				"giphyQuery": "Walking Dead"
			}
		},
		{
			"id": "ecrans-black-mirror-la-quatrieme-dimension",
			"category": "ecrans",
			"a": {
				"name": "Black Mirror",
				"origin": "Channel 4 · 2011",
				"line": "La technologie, et le pire de nous-mêmes.",
				"giphyIds": [],
				"giphyQuery": "Black Mirror"
			},
			"b": {
				"name": "La Quatrième Dimension",
				"origin": "CBS · 1959",
				"line": "Le surnaturel, en noir et blanc.",
				"giphyIds": [],
				"giphyQuery": "Twilight Zone"
			}
		},
		{
			"id": "ecrans-mercredi-la-famille-addams",
			"category": "ecrans",
			"a": {
				"name": "Mercredi",
				"origin": "Netflix · 2022",
				"line": "Une danse étrange, et une main qui marche.",
				"giphyIds": [],
				"giphyQuery": "Wednesday dance"
			},
			"b": {
				"name": "La Famille Addams",
				"origin": "Barry Sonnenfeld · 1991",
				"line": "Une famille macabre, et très unie.",
				"giphyIds": [],
				"giphyQuery": "Addams Family"
			}
		},
		{
			"id": "ecrans-bridget-jones-le-diable-s-habille-en-prada",
			"category": "ecrans",
			"a": {
				"name": "Bridget Jones",
				"origin": "Sharon Maguire · 2001",
				"line": "Un journal intime, et un pull de Noël.",
				"giphyIds": [],
				"giphyQuery": "Bridget Jones"
			},
			"b": {
				"name": "Le Diable s’habille en Prada",
				"origin": "David Frankel · 2006",
				"line": "Une patronne glaciale, et un pull bleu céruléen.",
				"giphyIds": [],
				"giphyQuery": "Devil Wears Prada"
			}
		},
		{
			"id": "ecrans-mamma-mia-la-la-land",
			"category": "ecrans",
			"a": {
				"name": "Mamma Mia!",
				"origin": "Phyllida Lloyd · 2008",
				"line": "ABBA, une île grecque, et trois pères possibles.",
				"giphyIds": [],
				"giphyQuery": "Mamma Mia"
			},
			"b": {
				"name": "La La Land",
				"origin": "Damien Chazelle · 2016",
				"line": "Des claquettes, et Los Angeles au coucher du soleil.",
				"giphyIds": [],
				"giphyQuery": "La La Land"
			}
		},
		{
			"id": "ecrans-le-roi-lion-1994-le-roi-lion-2019",
			"category": "ecrans",
			"a": {
				"name": "Le Roi lion (1994)",
				"origin": "Disney · 1994",
				"line": "Le dessin animé, et les larmes.",
				"giphyIds": [],
				"giphyQuery": "Lion King 1994"
			},
			"b": {
				"name": "Le Roi lion (2019)",
				"origin": "Disney · 2019",
				"line": "Le même, en images de synthèse.",
				"giphyIds": [],
				"giphyQuery": "Lion King 2019"
			}
		},
		{
			"id": "ecrans-trilogie-originale-prelogie",
			"category": "ecrans",
			"a": {
				"name": "Trilogie originale",
				"origin": "Star Wars · 1977",
				"line": "Les maquettes, et Harrison Ford.",
				"giphyIds": [],
				"giphyQuery": "Star Wars original"
			},
			"b": {
				"name": "Prélogie",
				"origin": "Star Wars · 1999",
				"line": "Les sabres en folie, et Jar Jar Binks.",
				"giphyIds": [],
				"giphyQuery": "Star Wars prequel"
			}
		},
		{
			"id": "ecrans-joker-the-dark-knight",
			"category": "ecrans",
			"a": {
				"name": "Joker",
				"origin": "Todd Phillips · 2019",
				"line": "Un escalier, et une descente.",
				"giphyIds": [],
				"giphyQuery": "Joker stairs"
			},
			"b": {
				"name": "The Dark Knight",
				"origin": "Christopher Nolan · 2008",
				"line": "Batman, Gotham, et un Joker inoubliable.",
				"giphyIds": [],
				"giphyQuery": "Dark Knight"
			}
		},
		{
			"id": "ecrans-tobey-maguire-tom-holland",
			"category": "ecrans",
			"a": {
				"name": "Tobey Maguire",
				"origin": "Spider-Man · 2002",
				"line": "Le premier, et une danse dans la rue.",
				"giphyIds": [],
				"giphyQuery": "Tobey Maguire Spider-Man"
			},
			"b": {
				"name": "Tom Holland",
				"origin": "Spider-Man · 2017",
				"line": "Le plus jeune, et le plus bavard.",
				"giphyIds": [],
				"giphyQuery": "Tom Holland Spider-Man"
			}
		},
		{
			"id": "ecrans-sean-connery-daniel-craig",
			"category": "ecrans",
			"a": {
				"name": "Sean Connery",
				"origin": "James Bond · 1962",
				"line": "Le premier, avec le smoking et l’accent écossais.",
				"giphyIds": [],
				"giphyQuery": "Sean Connery Bond"
			},
			"b": {
				"name": "Daniel Craig",
				"origin": "James Bond · 2006",
				"line": "Le plus brutal, et une chemise mouillée.",
				"giphyIds": ["PD8BbTOAB2e08"],
				"giphyQuery": "Daniel Craig Bond"
			}
		},
		{
			"id": "duos-batman-robin",
			"category": "duos",
			"a": {
				"name": "Batman",
				"origin": "DC · 1939",
				"line": "Le cerveau, la cape, et le budget.",
				"giphyIds": [],
				"giphyQuery": "Batman Robin"
			},
			"b": {
				"name": "Robin",
				"origin": "DC · 1940",
				"line": "L’acolyte, en collants verts.",
				"giphyIds": [],
				"giphyQuery": "Robin sidekick"
			}
		},
		{
			"id": "duos-han-solo-chewbacca",
			"category": "duos",
			"a": {
				"name": "Han Solo",
				"origin": "Star Wars · 1977",
				"line": "Le pilote qui parle.",
				"giphyIds": [],
				"giphyQuery": "Han Solo"
			},
			"b": {
				"name": "Chewbacca",
				"origin": "Star Wars · 1977",
				"line": "Le copilote qui grogne.",
				"giphyIds": [],
				"giphyQuery": "Chewbacca"
			}
		},
		{
			"id": "duos-frodon-sam",
			"category": "duos",
			"a": {
				"name": "Frodon",
				"origin": "Le Seigneur des anneaux · 1954",
				"line": "Il porte l’anneau.",
				"giphyIds": [],
				"giphyQuery": "Frodo"
			},
			"b": {
				"name": "Sam",
				"origin": "Le Seigneur des anneaux · 1954",
				"line": "Il porte Frodon.",
				"giphyIds": [],
				"giphyQuery": "Samwise"
			}
		},
		{
			"id": "duos-tic-tac",
			"category": "duos",
			"a": {
				"name": "Tic",
				"origin": "Disney · 1943",
				"line": "Le nez noir, et le plus malin.",
				"giphyIds": [],
				"giphyQuery": "Chip Disney"
			},
			"b": {
				"name": "Tac",
				"origin": "Disney · 1943",
				"line": "Le nez rouge, et le plus farfelu.",
				"giphyIds": [],
				"giphyQuery": "Dale Disney"
			}
		},
		{
			"id": "duos-starsky-hutch",
			"category": "duos",
			"a": {
				"name": "Starsky",
				"origin": "Série télé · 1975",
				"line": "Le pull à col châle, et la Gran Torino.",
				"giphyIds": [],
				"giphyQuery": "Starsky"
			},
			"b": {
				"name": "Hutch",
				"origin": "Série télé · 1975",
				"line": "Le blond, et le plus calme.",
				"giphyIds": [],
				"giphyQuery": "Starsky and Hutch"
			}
		},
		{
			"id": "duos-sammy-scooby-doo",
			"category": "duos",
			"a": {
				"name": "Sammy",
				"origin": "Scooby-Doo · 1969",
				"line": "Une barbiche, et une faim permanente.",
				"giphyIds": [],
				"giphyQuery": "Shaggy"
			},
			"b": {
				"name": "Scooby-Doo",
				"origin": "Scooby-Doo · 1969",
				"line": "Un chien peureux, et des biscuits.",
				"giphyIds": [],
				"giphyQuery": "Scooby Doo"
			}
		},
		{
			"id": "duos-calvin-hobbes",
			"category": "duos",
			"a": {
				"name": "Calvin",
				"origin": "Bill Watterson · 1985",
				"line": "Six ans, et une imagination débordante.",
				"giphyIds": [],
				"giphyQuery": "Calvin"
			},
			"b": {
				"name": "Hobbes",
				"origin": "Bill Watterson · 1985",
				"line": "Un tigre en peluche. Ou pas.",
				"giphyIds": [],
				"giphyQuery": "Hobbes tiger"
			}
		},
		{
			"id": "duos-wallace-gromit",
			"category": "duos",
			"a": {
				"name": "Wallace",
				"origin": "Aardman · 1989",
				"line": "Des inventions, et du fromage.",
				"giphyIds": [],
				"giphyQuery": "Wallace cheese"
			},
			"b": {
				"name": "Gromit",
				"origin": "Aardman · 1989",
				"line": "Un chien qui lève les yeux au ciel.",
				"giphyIds": [],
				"giphyQuery": "Gromit"
			}
		},
		{
			"id": "duos-bud-spencer-terence-hill",
			"category": "duos",
			"a": {
				"name": "Bud Spencer",
				"origin": "Cinéma · 1967",
				"line": "Le colosse, et des baffes en rafale.",
				"giphyIds": [],
				"giphyQuery": "Bud Spencer"
			},
			"b": {
				"name": "Terence Hill",
				"origin": "Cinéma · 1967",
				"line": "Les yeux bleus, et des baffes rapides.",
				"giphyIds": [],
				"giphyQuery": "Terence Hill"
			}
		},
		{
			"id": "duos-thelma-louise",
			"category": "duos",
			"a": {
				"name": "Thelma",
				"origin": "Thelma et Louise · 1991",
				"line": "Elle découvre la liberté en route.",
				"giphyIds": [],
				"giphyQuery": "Thelma Louise"
			},
			"b": {
				"name": "Louise",
				"origin": "Thelma et Louise · 1991",
				"line": "Elle tient le volant, et le plan.",
				"giphyIds": [],
				"giphyQuery": "road trip convertible"
			}
		},
		{
			"id": "duos-jay-silent-bob",
			"category": "duos",
			"a": {
				"name": "Jay",
				"origin": "Kevin Smith · 1994",
				"line": "Il ne se tait jamais.",
				"giphyIds": [],
				"giphyQuery": "Jay Silent Bob"
			},
			"b": {
				"name": "Silent Bob",
				"origin": "Kevin Smith · 1994",
				"line": "Il ne parle jamais.",
				"giphyIds": [],
				"giphyQuery": "Silent Bob"
			}
		},
		{
			"id": "duos-tintin-milou",
			"category": "duos",
			"a": {
				"name": "Tintin",
				"origin": "Hergé · 1929",
				"line": "Un reporter qui n’écrit jamais d’article.",
				"giphyIds": [],
				"giphyQuery": "Tintin"
			},
			"b": {
				"name": "Milou",
				"origin": "Hergé · 1929",
				"line": "Un chien blanc, qui aime l’os et le whisky.",
				"giphyIds": [],
				"giphyQuery": "Snowy Tintin"
			}
		},
		{
			"id": "duos-bonnie-clyde",
			"category": "duos",
			"a": {
				"name": "Bonnie",
				"origin": "Histoire vraie · 1930",
				"line": "Des poèmes, et une cavale.",
				"giphyIds": [],
				"giphyQuery": "Bonnie Parker"
			},
			"b": {
				"name": "Clyde",
				"origin": "Histoire vraie · 1930",
				"line": "Une voiture, et une cavale aussi.",
				"giphyIds": [],
				"giphyQuery": "Bonnie and Clyde"
			}
		},
		{
			"id": "duos-sonny-cher",
			"category": "duos",
			"a": {
				"name": "Sonny",
				"origin": "Musique · 1965",
				"line": "La moustache, et les chansons.",
				"giphyIds": [],
				"giphyQuery": "Sonny Bono"
			},
			"b": {
				"name": "Cher",
				"origin": "Musique · 1965",
				"line": "La voix, et une carrière sans fin.",
				"giphyIds": [],
				"giphyQuery": "Cher"
			}
		},
		{
			"id": "duos-simon-garfunkel",
			"category": "duos",
			"a": {
				"name": "Simon",
				"origin": "Musique · 1964",
				"line": "Les chansons, la guitare.",
				"giphyIds": [],
				"giphyQuery": "Paul Simon"
			},
			"b": {
				"name": "Garfunkel",
				"origin": "Musique · 1964",
				"line": "La voix d’ange, les boucles.",
				"giphyIds": [],
				"giphyQuery": "Art Garfunkel"
			}
		},
		{
			"id": "duos-ken-barbie",
			"category": "duos",
			"a": {
				"name": "Ken",
				"origin": "Mattel · 1961",
				"line": "Un sourire, et beaucoup d’accessoires.",
				"giphyIds": [],
				"giphyQuery": "Ken doll"
			},
			"b": {
				"name": "Barbie",
				"origin": "Mattel · 1959",
				"line": "Mille métiers, et la vedette.",
				"giphyIds": [],
				"giphyQuery": "Barbie doll"
			}
		},
		{
			"id": "duos-pif-hercule",
			"category": "duos",
			"a": {
				"name": "Pif",
				"origin": "Pif Gadget · 1945",
				"line": "Un chien jovial et dévoué.",
				"giphyIds": [],
				"giphyQuery": "cartoon dog"
			},
			"b": {
				"name": "Hercule",
				"origin": "Pif Gadget · 1950",
				"line": "Un chat râleur, toujours puni.",
				"giphyIds": [],
				"giphyQuery": "cartoon cat"
			}
		},
		{
			"id": "duos-riggs-murtaugh",
			"category": "duos",
			"a": {
				"name": "Riggs",
				"origin": "L’Arme fatale · 1987",
				"line": "Le flic incontrôlable.",
				"giphyIds": [],
				"giphyQuery": "Lethal Weapon Riggs"
			},
			"b": {
				"name": "Murtaugh",
				"origin": "L’Arme fatale · 1987",
				"line": "« Je suis trop vieux pour ces bêtises. »",
				"giphyIds": [],
				"giphyQuery": "Lethal Weapon Murtaugh"
			}
		},
		{
			"id": "duos-jules-vincent",
			"category": "duos",
			"a": {
				"name": "Jules",
				"origin": "Pulp Fiction · 1994",
				"line": "Il cite la Bible, et ne plaisante pas.",
				"giphyIds": [],
				"giphyQuery": "Jules Pulp Fiction"
			},
			"b": {
				"name": "Vincent",
				"origin": "Pulp Fiction · 1994",
				"line": "Il danse, et il parle de hamburgers.",
				"giphyIds": [],
				"giphyQuery": "Vincent Vega dance"
			}
		},
		{
			"id": "duos-kad-olivier",
			"category": "duos",
			"a": {
				"name": "Kad",
				"origin": "Kad et Olivier · 1990",
				"line": "Le grand, au sourire en coin.",
				"giphyIds": [],
				"giphyQuery": "comedy duo"
			},
			"b": {
				"name": "Olivier",
				"origin": "Kad et Olivier · 1990",
				"line": "Le partenaire au second degré.",
				"giphyIds": [],
				"giphyQuery": "comedy duo laughing"
			}
		},
		{
			"id": "duos-eric-ramzy",
			"category": "duos",
			"a": {
				"name": "Éric",
				"origin": "Éric et Ramzy · 1994",
				"line": "Le grand, et l’absurde.",
				"giphyIds": [],
				"giphyQuery": "Eric et Ramzy"
			},
			"b": {
				"name": "Ramzy",
				"origin": "Éric et Ramzy · 1994",
				"line": "Le grand aussi, et encore plus absurde.",
				"giphyIds": [],
				"giphyQuery": "Ramzy"
			}
		},
		{
			"id": "duos-arthur-perceval",
			"category": "duos",
			"a": {
				"name": "Arthur",
				"origin": "Kaamelott · 2005",
				"line": "Le roi qui en a assez de tout le monde.",
				"giphyIds": [],
				"giphyQuery": "Kaamelott Arthur"
			},
			"b": {
				"name": "Perceval",
				"origin": "Kaamelott · 2005",
				"line": "« C’est pas faux. »",
				"giphyIds": [],
				"giphyQuery": "Kaamelott Perceval"
			}
		},
		{
			"id": "duos-ross-rachel",
			"category": "duos",
			"a": {
				"name": "Ross",
				"origin": "Friends · 1994",
				"line": "« On faisait une pause ! »",
				"giphyIds": [],
				"giphyQuery": "Ross Friends"
			},
			"b": {
				"name": "Rachel",
				"origin": "Friends · 1994",
				"line": "Une coupe de cheveux devenue mythique.",
				"giphyIds": [],
				"giphyQuery": "Rachel Friends"
			}
		},
		{
			"id": "duos-chandler-joey",
			"category": "duos",
			"a": {
				"name": "Chandler",
				"origin": "Friends · 1994",
				"line": "L’humour comme armure.",
				"giphyIds": [],
				"giphyQuery": "Chandler Bing"
			},
			"b": {
				"name": "Joey",
				"origin": "Friends · 1994",
				"line": "« Comment tu vas ? »",
				"giphyIds": [],
				"giphyQuery": "Joey how you doin"
			}
		},
		{
			"id": "duos-sheldon-leonard",
			"category": "duos",
			"a": {
				"name": "Sheldon",
				"origin": "The Big Bang Theory · 2007",
				"line": "« Bazinga ! »",
				"giphyIds": [],
				"giphyQuery": "Sheldon bazinga"
			},
			"b": {
				"name": "Leonard",
				"origin": "The Big Bang Theory · 2007",
				"line": "Le colocataire qui supporte tout.",
				"giphyIds": [],
				"giphyQuery": "Leonard Big Bang"
			}
		},
		{
			"id": "duos-homer-marge",
			"category": "duos",
			"a": {
				"name": "Homer",
				"origin": "Les Simpson · 1989",
				"line": "« D’oh ! » Et des donuts.",
				"giphyIds": [],
				"giphyQuery": "Homer Simpson"
			},
			"b": {
				"name": "Marge",
				"origin": "Les Simpson · 1989",
				"line": "Des cheveux bleus, et une patience infinie.",
				"giphyIds": [],
				"giphyQuery": "Marge Simpson"
			}
		},
		{
			"id": "duos-lilo-stitch",
			"category": "duos",
			"a": {
				"name": "Lilo",
				"origin": "Lilo et Stitch · 2002",
				"line": "Hawaï, et l’ohana.",
				"giphyIds": [],
				"giphyQuery": "Lilo"
			},
			"b": {
				"name": "Stitch",
				"origin": "Lilo et Stitch · 2002",
				"line": "Un extraterrestre, et beaucoup de bêtises.",
				"giphyIds": [],
				"giphyQuery": "Stitch ohana"
			}
		},
		{
			"id": "duos-flash-mcqueen-martin",
			"category": "duos",
			"a": {
				"name": "Flash McQueen",
				"origin": "Cars · 2006",
				"line": "« Ka-tchow ! »",
				"giphyIds": [],
				"giphyQuery": "Lightning McQueen"
			},
			"b": {
				"name": "Martin",
				"origin": "Cars · 2006",
				"line": "Une dépanneuse rouillée, et un grand cœur.",
				"giphyIds": [],
				"giphyQuery": "Mater Cars"
			}
		},
		{
			"id": "duos-rox-rouky",
			"category": "duos",
			"a": {
				"name": "Rox",
				"origin": "Rox et Rouky · 1981",
				"line": "Un renard.",
				"giphyIds": [],
				"giphyQuery": "fox cub"
			},
			"b": {
				"name": "Rouky",
				"origin": "Rox et Rouky · 1981",
				"line": "Un chien de chasse.",
				"giphyIds": [],
				"giphyQuery": "hound puppy"
			}
		},
		{
			"id": "duos-la-belle-le-clochard",
			"category": "duos",
			"a": {
				"name": "La Belle",
				"origin": "La Belle et le Clochard · 1955",
				"line": "Une cocker élégante.",
				"giphyIds": [],
				"giphyQuery": "Lady Disney"
			},
			"b": {
				"name": "Le Clochard",
				"origin": "La Belle et le Clochard · 1955",
				"line": "Un chien des rues, et un plat de spaghettis.",
				"giphyIds": [],
				"giphyQuery": "Lady and the Tramp spaghetti"
			}
		},
		{
			"id": "duos-ratchet-clank",
			"category": "duos",
			"a": {
				"name": "Ratchet",
				"origin": "Insomniac · 2002",
				"line": "Un mécanicien aux grandes oreilles.",
				"giphyIds": [],
				"giphyQuery": "Ratchet"
			},
			"b": {
				"name": "Clank",
				"origin": "Insomniac · 2002",
				"line": "Un petit robot, et le cerveau du duo.",
				"giphyIds": [],
				"giphyQuery": "Clank robot"
			}
		},
		{
			"id": "duos-phineas-ferb",
			"category": "duos",
			"a": {
				"name": "Phinéas",
				"origin": "Phinéas et Ferb · 2007",
				"line": "Le chef de projet des vacances.",
				"giphyIds": [],
				"giphyQuery": "Phineas"
			},
			"b": {
				"name": "Ferb",
				"origin": "Phinéas et Ferb · 2007",
				"line": "Il ne parle presque pas, et il construit tout.",
				"giphyIds": [],
				"giphyQuery": "Ferb"
			}
		},
		{
			"id": "duos-joe-dalton-averell-dalton",
			"category": "duos",
			"a": {
				"name": "Joe Dalton",
				"origin": "Lucky Luke · 1951",
				"line": "Le plus petit, le plus colérique.",
				"giphyIds": [],
				"giphyQuery": "Joe Dalton"
			},
			"b": {
				"name": "Averell Dalton",
				"origin": "Lucky Luke · 1951",
				"line": "Le plus grand, le plus affamé.",
				"giphyIds": [],
				"giphyQuery": "Averell Dalton"
			}
		},
		{
			"id": "duos-fred-pierrafeu-barney-laroche",
			"category": "duos",
			"a": {
				"name": "Fred Pierrafeu",
				"origin": "Les Pierrafeu · 1960",
				"line": "« Yabba-dabba-doo ! »",
				"giphyIds": [],
				"giphyQuery": "Fred Flintstone"
			},
			"b": {
				"name": "Barney Laroche",
				"origin": "Les Pierrafeu · 1960",
				"line": "Le voisin, et le meilleur ami.",
				"giphyIds": [],
				"giphyQuery": "Barney Rubble"
			}
		},
		{
			"id": "duos-popeye-olive",
			"category": "duos",
			"a": {
				"name": "Popeye",
				"origin": "E. C. Segar · 1929",
				"line": "Des épinards, et des bras énormes.",
				"giphyIds": [],
				"giphyQuery": "Popeye spinach"
			},
			"b": {
				"name": "Olive",
				"origin": "E. C. Segar · 1919",
				"line": "Une grande silhouette, et elle était là avant lui.",
				"giphyIds": [],
				"giphyQuery": "Olive Oyl"
			}
		},
		{
			"id": "quotidien-lave-vaisselle-vaisselle-a-la-main",
			"category": "quotidien",
			"a": {
				"name": "Lave-vaisselle",
				"origin": "La cuisine",
				"line": "On le remplit, il travaille.",
				"giphyIds": [],
				"giphyQuery": "dishwasher"
			},
			"b": {
				"name": "Vaisselle à la main",
				"origin": "L’évier",
				"line": "Les mains dans l’eau, et le calme.",
				"giphyIds": [],
				"giphyQuery": "washing dishes"
			}
		},
		{
			"id": "quotidien-ranger-tout-de-suite-la-chaise-a-vetements",
			"category": "quotidien",
			"a": {
				"name": "Ranger tout de suite",
				"origin": "L’armoire",
				"line": "Chaque vêtement à sa place, sur-le-champ.",
				"giphyIds": [],
				"giphyQuery": "folding clothes"
			},
			"b": {
				"name": "La chaise à vêtements",
				"origin": "La chambre",
				"line": "Ni sale, ni propre : la chaise.",
				"giphyIds": [],
				"giphyQuery": "clothes chair"
			}
		},
		{
			"id": "quotidien-couette-sur-les-pieds-pied-qui-depasse",
			"category": "quotidien",
			"a": {
				"name": "Couette sur les pieds",
				"origin": "Le lit",
				"line": "Tout bien couvert, et au chaud.",
				"giphyIds": [],
				"giphyQuery": "cozy blanket"
			},
			"b": {
				"name": "Pied qui dépasse",
				"origin": "Le lit aussi",
				"line": "Un pied dehors, pour réguler la température.",
				"giphyIds": [],
				"giphyQuery": "foot out of blanket"
			}
		},
		{
			"id": "quotidien-cote-gauche-du-lit-cote-droit-du-lit",
			"category": "quotidien",
			"a": {
				"name": "Côté gauche du lit",
				"origin": "La chambre",
				"line": "Ton côté, depuis toujours.",
				"giphyIds": [],
				"giphyQuery": "bed"
			},
			"b": {
				"name": "Côté droit du lit",
				"origin": "La chambre aussi",
				"line": "L’autre côté, et pas question d’échanger.",
				"giphyIds": [],
				"giphyQuery": "bed sleeping"
			}
		},
		{
			"id": "quotidien-fenetre-ouverte-fenetre-fermee",
			"category": "quotidien",
			"a": {
				"name": "Fenêtre ouverte",
				"origin": "La nuit",
				"line": "L’air frais, et les moustiques.",
				"giphyIds": [],
				"giphyQuery": "open window night"
			},
			"b": {
				"name": "Fenêtre fermée",
				"origin": "La nuit aussi",
				"line": "Le calme, et la chaleur.",
				"giphyIds": [],
				"giphyQuery": "closed window"
			}
		},
		{
			"id": "quotidien-sieste-pas-de-sieste",
			"category": "quotidien",
			"a": {
				"name": "Sieste",
				"origin": "Le canapé, 14 h",
				"line": "Vingt minutes, et une nouvelle personne.",
				"giphyIds": [],
				"giphyQuery": "nap"
			},
			"b": {
				"name": "Pas de sieste",
				"origin": "Le bureau, 14 h",
				"line": "Tenir bon, et regretter.",
				"giphyIds": [],
				"giphyQuery": "sleepy office"
			}
		},
		{
			"id": "quotidien-courses-en-ligne-courses-au-supermarche",
			"category": "quotidien",
			"a": {
				"name": "Courses en ligne",
				"origin": "L’application",
				"line": "Livrées à la porte, avec une banane en trop.",
				"giphyIds": [],
				"giphyQuery": "online grocery"
			},
			"b": {
				"name": "Courses au supermarché",
				"origin": "Le chariot",
				"line": "Une roue qui grince, et des tentations partout.",
				"giphyIds": [],
				"giphyQuery": "shopping cart"
			}
		},
		{
			"id": "quotidien-liste-de-courses-improviser",
			"category": "quotidien",
			"a": {
				"name": "Liste de courses",
				"origin": "Le frigo",
				"line": "Tout est noté, rien n’est oublié.",
				"giphyIds": [],
				"giphyQuery": "shopping list"
			},
			"b": {
				"name": "Improviser",
				"origin": "Le rayon",
				"line": "On rentre avec des chips et sans pain.",
				"giphyIds": [],
				"giphyQuery": "grocery shopping"
			}
		},
		{
			"id": "quotidien-especes-carte-bancaire",
			"category": "quotidien",
			"a": {
				"name": "Espèces",
				"origin": "Le porte-monnaie",
				"line": "Des pièces, et le compte exact.",
				"giphyIds": [],
				"giphyQuery": "cash"
			},
			"b": {
				"name": "Carte bancaire",
				"origin": "Le portefeuille",
				"line": "Sans contact, et sans compter.",
				"giphyIds": [],
				"giphyQuery": "card payment"
			}
		},
		{
			"id": "quotidien-escalier-ascenseur",
			"category": "quotidien",
			"a": {
				"name": "Escalier",
				"origin": "Le palier",
				"line": "Du sport gratuit, et le souffle court.",
				"giphyIds": [],
				"giphyQuery": "stairs"
			},
			"b": {
				"name": "Ascenseur",
				"origin": "Le hall",
				"line": "Rapide, et un silence gênant.",
				"giphyIds": [],
				"giphyQuery": "elevator awkward"
			}
		},
		{
			"id": "quotidien-voiture-transports-en-commun",
			"category": "quotidien",
			"a": {
				"name": "Voiture",
				"origin": "Le garage",
				"line": "Partir quand on veut, et chercher une place.",
				"giphyIds": [],
				"giphyQuery": "driving car"
			},
			"b": {
				"name": "Transports en commun",
				"origin": "La station",
				"line": "Lire, dormir, et parfois attendre.",
				"giphyIds": [],
				"giphyQuery": "metro subway"
			}
		},
		{
			"id": "quotidien-velo-trottinette",
			"category": "quotidien",
			"a": {
				"name": "Vélo",
				"origin": "La piste cyclable",
				"line": "Les mollets, l’air frais, et la pluie.",
				"giphyIds": [],
				"giphyQuery": "bicycle city"
			},
			"b": {
				"name": "Trottinette",
				"origin": "Le trottoir",
				"line": "Électrique, rapide, et un peu périlleuse.",
				"giphyIds": [],
				"giphyQuery": "electric scooter"
			}
		},
		{
			"id": "quotidien-teletravail-bureau",
			"category": "quotidien",
			"a": {
				"name": "Télétravail",
				"origin": "Le salon",
				"line": "Le pyjama en bas, la chemise en haut.",
				"giphyIds": [],
				"giphyQuery": "working from home"
			},
			"b": {
				"name": "Bureau",
				"origin": "L’open space",
				"line": "Les collègues, la machine à café, et les réunions.",
				"giphyIds": [],
				"giphyQuery": "office"
			}
		},
		{
			"id": "quotidien-lundi-matin-dimanche-soir",
			"category": "quotidien",
			"question": "Le pire moment de la semaine : lundi matin ou dimanche soir ?",
			"a": {
				"name": "Lundi matin",
				"origin": "Le réveil",
				"line": "La semaine commence. Courage.",
				"giphyIds": [],
				"giphyQuery": "monday morning"
			},
			"b": {
				"name": "Dimanche soir",
				"origin": "Le canapé",
				"line": "Le week-end se termine. Courage aussi.",
				"giphyIds": [],
				"giphyQuery": "sunday night blues"
			}
		},
		{
			"id": "quotidien-anniversaire-surprise-anniversaire-organise",
			"category": "quotidien",
			"a": {
				"name": "Anniversaire surprise",
				"origin": "Le salon dans le noir",
				"line": "« Surprise ! » Et un cœur qui s’emballe.",
				"giphyIds": [],
				"giphyQuery": "surprise party"
			},
			"b": {
				"name": "Anniversaire organisé",
				"origin": "L’invitation",
				"line": "Tout est prévu, et c’est très bien.",
				"giphyIds": [],
				"giphyQuery": "birthday party"
			}
		},
		{
			"id": "quotidien-cadeau-utile-cadeau-surprise",
			"category": "quotidien",
			"a": {
				"name": "Cadeau utile",
				"origin": "Le paquet",
				"line": "Ce dont tu avais vraiment besoin.",
				"giphyIds": [],
				"giphyQuery": "practical gift"
			},
			"b": {
				"name": "Cadeau surprise",
				"origin": "Le paquet aussi",
				"line": "Ce dont tu ne savais pas avoir besoin.",
				"giphyIds": [],
				"giphyQuery": "surprise gift"
			}
		},
		{
			"id": "quotidien-cadeaux-le-24-cadeaux-le-25",
			"category": "quotidien",
			"question": "Les cadeaux de Noël : le 24 au soir ou le 25 au matin ?",
			"a": {
				"name": "Cadeaux le 24",
				"origin": "Le réveillon",
				"line": "Tout de suite, après le repas.",
				"giphyIds": [],
				"giphyQuery": "christmas eve presents"
			},
			"b": {
				"name": "Cadeaux le 25",
				"origin": "Le matin de Noël",
				"line": "Au réveil, en pyjama.",
				"giphyIds": [],
				"giphyQuery": "christmas morning presents"
			}
		},
		{
			"id": "quotidien-sapin-naturel-sapin-artificiel",
			"category": "quotidien",
			"a": {
				"name": "Sapin naturel",
				"origin": "La forêt",
				"line": "L’odeur, et les aiguilles jusqu’en mars.",
				"giphyIds": [],
				"giphyQuery": "christmas tree"
			},
			"b": {
				"name": "Sapin artificiel",
				"origin": "Le grenier",
				"line": "Toujours parfait, et rangé dans un carton.",
				"giphyIds": [],
				"giphyQuery": "fake christmas tree"
			}
		},
		{
			"id": "quotidien-camping-hotel",
			"category": "quotidien",
			"a": {
				"name": "Camping",
				"origin": "La tente",
				"line": "Les étoiles, et le duvet humide.",
				"giphyIds": [],
				"giphyQuery": "camping tent"
			},
			"b": {
				"name": "Hôtel",
				"origin": "La chambre",
				"line": "Le lit fait, et le petit-déjeuner servi.",
				"giphyIds": [],
				"giphyQuery": "hotel room"
			}
		},
		{
			"id": "quotidien-avion-train",
			"category": "quotidien",
			"a": {
				"name": "Avion",
				"origin": "Le ciel",
				"line": "Rapide, et des files d’attente partout.",
				"giphyIds": [],
				"giphyQuery": "airplane"
			},
			"b": {
				"name": "Train",
				"origin": "Les rails",
				"line": "Le paysage, la place pour les jambes, et le wagon-bar.",
				"giphyIds": [],
				"giphyQuery": "train window"
			}
		},
		{
			"id": "quotidien-hublot-couloir",
			"category": "quotidien",
			"question": "En avion : côté hublot ou côté couloir ?",
			"a": {
				"name": "Hublot",
				"origin": "La rangée",
				"line": "La vue, et le passage par-dessus les voisins.",
				"giphyIds": [],
				"giphyQuery": "airplane window"
			},
			"b": {
				"name": "Couloir",
				"origin": "La rangée aussi",
				"line": "Les jambes allongées, et la liberté.",
				"giphyIds": [],
				"giphyQuery": "airplane aisle"
			}
		},
		{
			"id": "quotidien-reveillon-festif-reveillon-en-pyjama",
			"category": "quotidien",
			"a": {
				"name": "Réveillon festif",
				"origin": "La soirée",
				"line": "Des paillettes, et le compte à rebours.",
				"giphyIds": [],
				"giphyQuery": "new year party"
			},
			"b": {
				"name": "Réveillon en pyjama",
				"origin": "Le canapé",
				"line": "Un plaid, et au lit à minuit cinq.",
				"giphyIds": [],
				"giphyQuery": "new year pajamas"
			}
		},
		{
			"id": "quotidien-tondre-la-pelouse-laisser-pousser",
			"category": "quotidien",
			"a": {
				"name": "Tondre la pelouse",
				"origin": "Le jardin",
				"line": "Un gazon net, et le bruit du dimanche matin.",
				"giphyIds": [],
				"giphyQuery": "lawn mowing"
			},
			"b": {
				"name": "Laisser pousser",
				"origin": "Le jardin aussi",
				"line": "Des fleurs sauvages, et des abeilles heureuses.",
				"giphyIds": [],
				"giphyQuery": "wild garden"
			}
		},
		{
			"id": "quotidien-plantes-vertes-plantes-en-plastique",
			"category": "quotidien",
			"a": {
				"name": "Plantes vertes",
				"origin": "Le salon",
				"line": "De la vie, et de l’arrosage.",
				"giphyIds": [],
				"giphyQuery": "house plants"
			},
			"b": {
				"name": "Plantes en plastique",
				"origin": "Le salon aussi",
				"line": "Toujours vertes, même sans toi.",
				"giphyIds": [],
				"giphyQuery": "fake plant"
			}
		},
		{
			"id": "quotidien-douche-le-matin-douche-le-soir",
			"category": "quotidien",
			"a": {
				"name": "Douche le matin",
				"origin": "La salle de bains, 7 h",
				"line": "Pour se réveiller.",
				"giphyIds": [],
				"giphyQuery": "morning shower"
			},
			"b": {
				"name": "Douche le soir",
				"origin": "La salle de bains, 22 h",
				"line": "Pour se détendre.",
				"giphyIds": [],
				"giphyQuery": "evening shower"
			}
		},
		{
			"id": "quotidien-mettre-le-couvert-debarrasser",
			"category": "quotidien",
			"a": {
				"name": "Mettre le couvert",
				"origin": "Avant le repas",
				"line": "On prépare, et on a faim.",
				"giphyIds": [],
				"giphyQuery": "setting table"
			},
			"b": {
				"name": "Débarrasser",
				"origin": "Après le repas",
				"line": "On range, et on est repu.",
				"giphyIds": [],
				"giphyQuery": "clearing table"
			}
		},
		{
			"id": "quotidien-petit-dejeuner-sucre-petit-dejeuner-sale",
			"category": "quotidien",
			"a": {
				"name": "Petit-déjeuner sucré",
				"origin": "La table du matin",
				"line": "Tartines, confiture, et céréales.",
				"giphyIds": [],
				"giphyQuery": "sweet breakfast"
			},
			"b": {
				"name": "Petit-déjeuner salé",
				"origin": "La table du matin aussi",
				"line": "Œufs, bacon, et fromage.",
				"giphyIds": [],
				"giphyQuery": "savory breakfast"
			}
		},
		{
			"id": "quotidien-brunch-petit-dejeuner-classique",
			"category": "quotidien",
			"a": {
				"name": "Brunch",
				"origin": "Le dimanche, 11 h",
				"line": "Tout à la fois, et pas de déjeuner après.",
				"giphyIds": [],
				"giphyQuery": "brunch"
			},
			"b": {
				"name": "Petit-déjeuner classique",
				"origin": "Le dimanche, 8 h",
				"line": "Café, tartines, et toute la journée devant soi.",
				"giphyIds": [],
				"giphyQuery": "coffee and toast"
			}
		},
		{
			"id": "quotidien-appel-video-appel-audio",
			"category": "quotidien",
			"a": {
				"name": "Appel vidéo",
				"origin": "L’écran",
				"line": "On se voit, et on regarde surtout sa tête.",
				"giphyIds": [],
				"giphyQuery": "video call"
			},
			"b": {
				"name": "Appel audio",
				"origin": "Le téléphone",
				"line": "On s’écoute, et on se promène en même temps.",
				"giphyIds": [],
				"giphyQuery": "phone call walking"
			}
		},
		{
			"id": "quotidien-repondre-tout-de-suite-repondre-trois-jours-plus-tard",
			"category": "quotidien",
			"a": {
				"name": "Répondre tout de suite",
				"origin": "La messagerie",
				"line": "Efficace, et un peu trop disponible.",
				"giphyIds": [],
				"giphyQuery": "quick reply"
			},
			"b": {
				"name": "Répondre trois jours plus tard",
				"origin": "La messagerie aussi",
				"line": "« Désolé, je viens de voir. »",
				"giphyIds": [],
				"giphyQuery": "late reply"
			}
		},
		{
			"id": "quotidien-musique-en-travaillant-silence",
			"category": "quotidien",
			"a": {
				"name": "Musique en travaillant",
				"origin": "Les écouteurs",
				"line": "Le rythme, et la concentration.",
				"giphyIds": [],
				"giphyQuery": "working with music"
			},
			"b": {
				"name": "Silence",
				"origin": "La bibliothèque",
				"line": "Rien, et c’est parfait.",
				"giphyIds": [],
				"giphyQuery": "quiet library"
			}
		},
		{
			"id": "quotidien-podcast-musique",
			"category": "quotidien",
			"a": {
				"name": "Podcast",
				"origin": "Les écouteurs",
				"line": "Apprendre en faisant la vaisselle.",
				"giphyIds": [],
				"giphyQuery": "podcast listening"
			},
			"b": {
				"name": "Musique",
				"origin": "Les écouteurs aussi",
				"line": "Chanter en faisant la vaisselle.",
				"giphyIds": [],
				"giphyQuery": "singing dishes"
			}
		},
		{
			"id": "quotidien-monopoly-uno",
			"category": "quotidien",
			"a": {
				"name": "Monopoly",
				"origin": "Le salon · 1935",
				"line": "Trois heures, une faillite, et une dispute.",
				"giphyIds": [],
				"giphyQuery": "Monopoly"
			},
			"b": {
				"name": "Uno",
				"origin": "Le salon · 1971",
				"line": "Un +4, et une amitié brisée.",
				"giphyIds": [],
				"giphyQuery": "Uno cards"
			}
		},
		{
			"id": "quotidien-en-avance-a-la-gare-courir-apres-le-train",
			"category": "quotidien",
			"a": {
				"name": "En avance à la gare",
				"origin": "Le quai",
				"line": "Vingt minutes à attendre, et l’esprit tranquille.",
				"giphyIds": [],
				"giphyQuery": "waiting train"
			},
			"b": {
				"name": "Courir après le train",
				"origin": "Le quai aussi",
				"line": "Les portes qui se ferment, et le cœur à 180.",
				"giphyIds": [],
				"giphyQuery": "running for train"
			}
		},
		{
			"id": "quotidien-faire-son-lit-ne-jamais-le-faire",
			"category": "quotidien",
			"a": {
				"name": "Faire son lit",
				"origin": "Le matin",
				"line": "Une chambre nette, et une journée qui commence bien.",
				"giphyIds": [],
				"giphyQuery": "making bed"
			},
			"b": {
				"name": "Ne jamais le faire",
				"origin": "Le matin aussi",
				"line": "À quoi bon, on y retourne ce soir.",
				"giphyIds": [],
				"giphyQuery": "messy bed"
			}
		},
		{
			"id": "quotidien-19-c-23-c",
			"category": "quotidien",
			"question": "Le thermostat en hiver : 19 °C ou 23 °C ?",
			"a": {
				"name": "19 °C",
				"origin": "Le thermostat",
				"line": "Un pull, et la planète qui te remercie.",
				"giphyIds": [],
				"giphyQuery": "sweater cozy"
			},
			"b": {
				"name": "23 °C",
				"origin": "Le thermostat aussi",
				"line": "Un t-shirt en plein hiver.",
				"giphyIds": [],
				"giphyQuery": "warm home"
			}
		}
	]
};
var ui_texts_fr_default = {
	site: {
		"title": "484 · Lequel tu préfères ?",
		"description": "Team Batman ou team Superman ? Des centaines de rivalités écrites à la main : choisis ton camp, et découvre si le reste du monde est d’accord.",
		"logo": "484",
		"name": "Lequel tu préfères ?",
		"socialLabel": "Ailleurs sur Internet",
		"skipToContent": "Aller au contenu",
		"motion": {
			"label": "Animations :",
			"on": "activées",
			"off": "réduites"
		},
		"email": "contact@team484.fr",
		"domain": "team484.fr",
		"toc": "Sommaire"
	},
	links: {
		"github": {
			"label": "GitHub",
			"url": "https://github.com/MZA-code"
		},
		"linkedin": {
			"label": "LinkedIn",
			"url": ""
		}
	},
	home: {
		"title": [
			"Il aurait pu faire",
			"un portfolio sérieux.",
			"Il a préféré ça."
		],
		"intro": "Batman ou Superman. Chat ou chien. Pain au chocolat ou chocolatine. Tu choisis ton camp, tu découvres si le reste du monde est d’accord. Ça ne s’arrête jamais. C’est voulu, et c’est un peu inquiétant.",
		"footnote": "Durée moyenne d’une visite : on ne sait pas, personne n’est encore reparti.",
		"mixedTheme": {
			"label": "Tout mélangé",
			"tagline": "Toutes les rivalités, dans le désordre. Batman, puis la raclette. Tu verras bien.",
			"icon": "shuffle"
		},
		"themesLabel": "Choisis ton arène",
		"play": "Jouer →",
		"playUniverse": "Tout l’univers →"
	},
	debate: {
		"pageTitle": "Débats",
		"number": "Débat n° {n}",
		"subtitle": "Ça ne s’arrête jamais. Tu peux partir quand tu veux. Personne ne part.",
		"question": "Team {a} ou team {b} ?",
		"categoriesLabel": "Catégories",
		"team": "Team",
		"vs": "VS",
		"skip": "Je ne connais aucun des deux",
		"none": {
			"button": "Aucun des deux",
			"choice": "Ni l’un ni l’autre, pour toi",
			"label": "Aucun des deux",
			"between": "entre {a} et {b}",
			"split": "aucun des deux · {percent} %"
		},
		"keysHint": "← et → pour choisir · ↓ pour aucun des deux · Échap pour revenir à l’accueil",
		"pickHint": "Choisis ton camp. Le reste du monde attend ton verdict.",
		"loading": "On sort les rivalités du placard…",
		"noscript": "Ce jeu a besoin de JavaScript. Comme la plupart des robots de ce site.",
		"choice": "Tu es team {name}",
		"share": "{percent} % des visiteurs aussi",
		"firstVote": "Tu es le premier à trancher ce débat. Pas de pression.",
		"milestoneLink": "On en parle sur LinkedIn →",
		"teams": {
			"title": "Tes teams",
			"empty": "Aucune team pour l’instant. Choisis ton camp.",
			"versus": "contre {name}"
		},
		"profile": {
			"title": "Ton profil",
			"count": {
				"one": "{n} débat tranché",
				"other": "{n} débats tranchés"
			},
			"agreement": "D’accord avec la majorité {percent} % du temps",
			"agreementUnknown": "D’accord avec la majorité : on ne sait pas encore",
			"rebels": {
				"one": "{n} choix rebelle",
				"other": "{n} choix rebelles"
			}
		},
		"hallLink": "Le classement mondial →",
		"universesLabel": "Univers",
		"wholeUniverse": "Tout l’univers",
		"shareButton": "Partager ce débat",
		"shareCopied": "Lien copié. Va semer la zizanie.",
		"shareText": "Tu es plutôt team {a} ou team {b} ? Viens trancher.",
		"shareDescription": "Team {a} ou team {b} ? Choisis ton camp, et découvre si le reste du monde est d’accord.",
		"loadError": "Les rivalités n’ont pas voulu sortir. Recharge la page, elles sont un peu timides.",
		"gifReport": {
			"button": "Mauvais GIF ?",
			"label": "Mauvais GIF ? Signaler le GIF de {name}",
			"thanks": [
				"Merci. Ce GIF a été envoyé au coin, il réfléchit à ce qu’il a fait.",
				"Bien vu, détective. L’imposteur a été démasqué.",
				"Signalé. Le stagiaire chargé des GIF va passer un sale quart d’heure (c’est un robot).",
				"Merci ! On cherche un sosie plus ressemblant.",
				"Noté. Ce GIF n’avait rien à faire là, et il le sait."
			],
			"limited": "Doucement, inspecteur : tu as déjà signalé beaucoup de GIF aujourd’hui.",
			"error": "Le signalement s’est perdu en route. Réessaie plus tard.",
			"admin": "Écarté. Voici le suivant (mode admin)."
		}
	},
	quips: {
		"high": [
			"Tu es dans la norme. C’est rassurant, et un peu triste.",
			"Choix validé par la majorité. Le comité approuve.",
			"Comme tout le monde. Mais avec conviction.",
			"Sans surprise. On t’aime quand même."
		],
		"mid": [
			"Ça s’est joué à un poil de moustache.",
			"Le public est divisé. Toi, non.",
			"Match serré. Les deux camps font appel.",
			"Un choix défendable devant un tribunal."
		],
		"low": [
			"Choix audacieux. On te surveille.",
			"Tu fais partie d’une élite. Ou d’une secte.",
			"Respect. Ou inquiétude. On hésite.",
			"Les statisticiens sont perplexes."
		],
		"neutral": [
			"Choix enregistré. L’Histoire jugera.",
			"Noté. On ne dira rien à personne.",
			"Décision prise. Pas de retour en arrière.",
			"C’est toi qui vois. Et tu as vu."
		]
	},
	achievements: {
		"title": "Tes achievements",
		"unlocked": "Achievement débloqué",
		"count": "{done} sur {total} débloqués",
		"next": "Prochain : {name}, encore {left}",
		"allDone": "Tout est débloqué. Il n’y a plus rien à prouver. Tu peux continuer quand même.",
		"locked": "verrouillé",
		"list": [
			{
				"id": "curieux",
				"kind": "debates",
				"goal": 10,
				"icon": "eye",
				"name": "Curieux",
				"description": "10 débats tranchés",
				"text": "10 débats. Tu avais sûrement autre chose à faire. Non ? Parfait."
			},
			{
				"id": "recrutable",
				"kind": "debates",
				"goal": 25,
				"icon": "briefcase",
				"name": "Recrutable",
				"description": "25 débats tranchés",
				"text": "25 débats. Si tu es recruteur, on devrait sérieusement se parler.",
				"link": true
			},
			{
				"id": "accro",
				"kind": "debates",
				"goal": 50,
				"icon": "heart",
				"name": "Accro",
				"description": "50 débats tranchés",
				"text": "50 débats. À ce stade, ce n’est plus un site, c’est une relation."
			},
			{
				"id": "centurion",
				"kind": "debates",
				"goal": 100,
				"icon": "medal",
				"name": "Centurion",
				"description": "100 débats tranchés",
				"text": "100 débats. Tu as vu passer plus de pop culture qu’un vidéoclub en 1995."
			},
			{
				"id": "insatiable",
				"kind": "debates",
				"goal": 200,
				"icon": "fire",
				"name": "Insatiable",
				"description": "200 débats tranchés",
				"text": "200 débats. Ton patron pense que tu travailles. D’une certaine façon, oui."
			},
			{
				"id": "legende-484",
				"kind": "debates",
				"goal": 484,
				"icon": "crown",
				"name": "Légende du 484",
				"description": "484 débats tranchés",
				"text": "484 débats. Le nombre fétiche de ce site. Tu as gagné notre respect éternel.",
				"link": true
			},
			{
				"id": "hors-categorie",
				"kind": "debates",
				"goal": 1e3,
				"icon": "trophy",
				"name": "Hors catégorie",
				"description": "1 000 débats tranchés",
				"text": "1 000 débats. On ne sait plus quoi te dire. Toi non plus, visiblement."
			},
			{
				"id": "rebelle",
				"kind": "rebels",
				"goal": 10,
				"icon": "hand-fist",
				"name": "Rebelle",
				"description": "10 choix contre la majorité",
				"text": "10 choix contre la majorité. Tu ne suis pas le troupeau. Le troupeau ne te suit pas non plus."
			},
			{
				"id": "dans-le-moule",
				"kind": "streak",
				"goal": 20,
				"icon": "people-group",
				"name": "Dans le moule",
				"description": "20 fois d’accord avec la majorité, d’affilée",
				"text": "20 fois d’accord avec la majorité, d’affilée. Tu n’as pas un avis, tu as L’avis."
			},
			{
				"id": "globe-trotteur",
				"kind": "universes",
				"goal": 4,
				"icon": "earth-europe",
				"name": "Globe-trotteur",
				"description": "Un débat tranché dans chacun des 4 univers",
				"text": "Les 4 univers visités. Écrans, pop culture, vraie vie, imaginaire : tu as fait le tour du propriétaire."
			},
			{
				"id": "explorateur",
				"kind": "categories",
				"goal": 20,
				"icon": "compass",
				"name": "Explorateur",
				"description": "Un débat tranché dans chacune des 20 catégories",
				"text": "Les 20 catégories. Tu as un avis sur tout. Littéralement tout."
			}
		]
	},
	hallOfFame: {
		"pageTitle": "Hall of Fame",
		"title": "Hall of Fame",
		"intro": "Le verdict mondial, voté par tous les visiteurs qui avaient sûrement mieux à faire.",
		"totalVotes": {
			"one": "{n} vote au compteur",
			"other": "{n} votes au compteur"
		},
		"filterLabel": "Filtrer par catégorie",
		"popularTitle": "Les plus votés",
		"popularIntro": "Tout le monde a un avis là-dessus. Absolument tout le monde.",
		"podium": [
			"Le débat du siècle. Ou au moins de la semaine.",
			"Presque aussi clivant. Presque.",
			"Le bronze du clash. Honorable."
		],
		"closeTitle": "Les plus serrés",
		"closeIntro": "Le pays est coupé en deux. Les repas de famille aussi.",
		"landslideTitle": "Les plus écrasants",
		"landslideIntro": "Il n’y a pas eu de débat. Juste une exécution.",
		"votes": {
			"one": "{n} vote",
			"other": "{n} votes"
		},
		"none": "{percent} % aucun des deux",
		"empty": "Pas encore de votes ici. Va jouer, le classement compte sur toi.",
		"emptySection": "Pas encore assez de votes pour juger. Il en faut au moins dix par débat.",
		"loading": "On recompte les bulletins…",
		"error": "Le classement fait la sieste. Les votes, eux, continuent.",
		"play": "Retour aux débats →"
	},
	notFound: {
		"pageTitle": "Page introuvable",
		"code": "404",
		"title": "Cette page a perdu le débat.",
		"text": "Elle affrontait une page qui existe. Le public a tranché, sans appel.",
		"back": "Retour aux débats →"
	},
	footer: {
		"projects": "Voir mes autres projets →",
		"disclaimer": "Aucune team n’a été blessée pendant les débats. Leur ego, si.",
		"giphy": {
			"label": "Powered by GIPHY",
			"url": "https://giphy.com/"
		},
		"tenor": {
			"label": "GIF via Tenor",
			"url": "https://tenor.com/"
		},
		"hallOfFame": "Hall of Fame",
		"legal": {
			"label": "Informations",
			"debates": "Tous les débats",
			"about": "À propos",
			"mentions": "Mentions légales",
			"privacy": "Confidentialité",
			"accessibility": "Accessibilité : partiellement conforme"
		},
		"version": "Version {version}"
	},
	projectsPage: {
		"title": "Mes autres projets",
		"intro": "Aucun n’a été élu par vote populaire.",
		"back": "Retour aux débats →"
	},
	projects: [
		{
			"kind": "JEU · 2026",
			"title": "LATENCE",
			"text": "Escape game de plus d’une heure, joué sur un Minitel recréé dans le navigateur, quelque part entre la Terre et Mars.",
			"url": "https://latence-game.com/",
			"cta": "latence-game.com"
		},
		{
			"kind": "PLATEFORME · 2026",
			"title": "Emballé, c’est pesé",
			"text": "Enchères à l’envers : l’acheteur fixe son prix, les marchands baissent les leurs pour remporter la vente.",
			"url": "https://emballecestpese.fr/",
			"cta": "emballecestpese.fr"
		},
		{
			"kind": "DONNÉES · 2026",
			"title": "Baromètre démocratique",
			"text": "21 indicateurs sourcés sur la démocratie en France, recalculés chaque jour, sans note ni opinion.",
			"url": "https://barometre-democratique.fr/",
			"cta": "barometre-democratique.fr"
		},
		{
			"kind": "EXTENSION CHROME · 2026",
			"title": "Lunettes de vérité",
			"text": "D’après Invasion Los Angeles (1988) : chausse-les, et les publicités révèlent enfin leur vrai message.",
			"url": "https://github.com/MZA-code/truth-glasses",
			"cta": "GitHub"
		}
	],
	pages: /* @__PURE__ */ JSON.parse("{\"mentions\":{\"title\":\"Mentions légales\",\"description\":\"Éditeur, hébergeur et propriété intellectuelle du site {domain}.\",\"updated\":\"Dernière mise à jour : 21 novembre 2026\",\"sections\":[{\"title\":\"Éditeur du site\",\"blocks\":[\"{domain} est un site personnel, édité à titre non professionnel par un particulier.\",\"Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique (LCEN), l’éditeur a choisi de préserver son anonymat. Ses coordonnées ont été communiquées à l’hébergeur, qui les tient à la disposition des autorités.\",\"Directeur de la publication : l’éditeur du site, joignable à {email}.\"]},{\"title\":\"Hébergeur\",\"blocks\":[[\"o2switch, SAS au capital de 100 000 €\",\"Chemin des Pardiaux, 63000 Clermont-Ferrand, France\",\"Téléphone : 04 44 44 60 40\",\"RCS Clermont-Ferrand, SIRET 510 909 807 00032\",\"Site : [www.o2switch.fr](https://www.o2switch.fr)\"]]},{\"title\":\"Propriété intellectuelle\",\"blocks\":[\"Les textes du site (questions, répliques et remarques) sont originaux.\",\"Les personnages, œuvres, marques et personnalités cités dans les rivalités appartiennent à leurs propriétaires respectifs. Ils sont mentionnés à titre humoristique et informatif, sans affiliation ni partenariat d’aucune sorte.\",\"Les GIF animés sont fournis par [GIPHY](https://giphy.com). Leurs droits appartiennent à leurs auteurs.\",\"Icônes : [Font Awesome Free](https://fontawesome.com), sous licence CC BY 4.0. Polices : Anton, Space Grotesk et Space Mono, sous licence SIL Open Font License.\"]},{\"title\":\"Signaler un contenu\",\"blocks\":[\"Une rivalité, une réplique ou un GIF te semble déplacé, ou porte atteinte à tes droits ? Écris à {email} en indiquant l’adresse de la page : le contenu sera examiné et, si besoin, retiré rapidement.\"]},{\"title\":\"Données personnelles et cookies\",\"blocks\":[\"Le site ne dépose aucun cookie et ne mesure pas l’audience. Tout est expliqué dans la [politique de confidentialité](/confidentialite).\"]}]},\"privacy\":{\"title\":\"Confidentialité\",\"description\":\"Aucun cookie, aucune mesure d’audience : ce que {domain} fait, et ne fait pas, de tes données.\",\"updated\":\"Dernière mise à jour : 22 novembre 2026\",\"sections\":[{\"title\":\"En bref\",\"blocks\":[[\"Aucun cookie, aucune publicité, aucune mesure d’audience, aucun compte.\",\"Tes votes sont anonymes : le site ne garde que des compteurs par rivalité.\",\"Le bouton « Mauvais GIF ? » n’envoie que la team et le GIF concernés.\",\"Ta progression reste dans ton navigateur et n’est jamais envoyée.\",\"Deux services tiers, pour les GIF seulement : GIPHY et, pour quelques-uns, Tenor (Google).\"]]},{\"title\":\"Responsable du traitement\",\"blocks\":[\"L’éditeur du site (voir les [mentions légales](/mentions-legales)), joignable à {email}.\"]},{\"title\":\"Les votes\",\"blocks\":[\"Quand tu choisis une team, ton navigateur envoie au serveur la rivalité, la team choisie (ou « aucun des deux ») et la catégorie en cours. Rien d’autre : ni identifiant, ni cookie.\",\"Le serveur ajoute une voix au compteur de la rivalité. Il ne garde jamais la team que tu as choisie : personne ne peut retrouver ton vote, pas même l’éditeur.\"]},{\"title\":\"Les signalements de GIF\",\"blocks\":[\"Quand tu cliques sur « Mauvais GIF ? », ton navigateur envoie au serveur la rivalité, la team et l’identifiant du GIF affiché. Rien d’autre : ni identifiant, ni cookie.\",\"Le serveur ajoute un signalement au compteur de ce GIF, sans garder la trace de qui l’a signalé. Ces compteurs servent uniquement à choisir de meilleurs GIF : un GIF trop signalé est remplacé automatiquement.\"]},{\"title\":\"Protection contre les abus\",\"blocks\":[\"Pour qu’un robot ne puisse pas fausser les pourcentages, le nombre de votes et de signalements est limité par visiteur. Le serveur calcule pour cela une empreinte de ton adresse IP, mélangée à une clé secrète et à la date du jour (hachage SHA-256). L’adresse IP elle-même n’est jamais enregistrée.\",\"Cette empreinte change chaque jour et ne permet pas de retrouver l’adresse d’origine. Pour qu’un même visiteur ne compte qu’une fois par jour, le serveur la garde aussi à côté des débats tranchés et des GIF signalés dans la journée (jamais à côté de la team choisie).\",\"Toutes les empreintes de la veille sont effacées automatiquement.\",\"Base légale : l’intérêt légitime de l’éditeur à protéger le service (article 6.1.f du RGPD).\"]},{\"title\":\"Journaux de l’hébergeur\",\"blocks\":[\"Comme tout hébergeur, o2switch enregistre des journaux techniques (adresse IP, date, page demandée, navigateur) pour assurer la sécurité et le bon fonctionnement de ses serveurs. Ils sont conservés selon sa politique et ses obligations légales, puis supprimés. L’éditeur ne s’en sert pas pour suivre les visiteurs.\"]},{\"title\":\"Ce qui reste dans ton navigateur\",\"blocks\":[\"Le site garde deux informations dans le stockage local de ton navigateur :\",[\"ta progression (débats tranchés, tes teams, ta catégorie), pour reprendre la partie là où tu l’as laissée ;\",\"ta préférence d’animations, si tu as utilisé l’interrupteur en haut de page.\"],\"Ces informations ne quittent jamais ton appareil. Elles servent uniquement des fonctions que tu demandes toi-même : à ce titre, elles ne nécessitent pas de consentement (article 82 de la loi Informatique et Libertés). Pour les effacer, supprime les données du site dans les réglages de ton navigateur.\"]},{\"title\":\"Les GIF, fournis par GIPHY et Tenor\",\"blocks\":[\"Les GIF sont recherchés par le serveur du site, pas par ton navigateur : tes choix ne sont jamais transmis à GIPHY.\",\"Ton navigateur télécharge ensuite les vidéos directement depuis les serveurs de GIPHY, une société américaine. Comme pour toute image chargée sur Internet, GIPHY reçoit alors ton adresse IP et des informations techniques sur ton navigateur. Ces serveurs ne déposent aucun cookie.\",\"Quelques GIF, choisis à la main par l’éditeur, viennent de Tenor, un service de Google. Ton navigateur les télécharge depuis les serveurs d’images de Tenor, qui reçoivent de la même façon ton adresse IP et des informations techniques. Ces serveurs ne déposent aucun cookie (vérifié le 22 novembre 2026).\",\"Pour en savoir plus : la [politique de confidentialité de GIPHY](https://giphy.com/privacy) et les [règles de confidentialité de Google](https://policies.google.com/privacy).\"]},{\"title\":\"Polices de caractères\",\"blocks\":[\"Les polices sont hébergées sur le serveur du site : aucune requête n’est envoyée à Google Fonts ni à un autre service.\"]},{\"title\":\"Tes droits\",\"blocks\":[\"Tu disposes d’un droit d’accès, de rectification, d’effacement, de limitation et d’opposition. Comme le site ne conserve aucune donnée permettant de t’identifier, il n’est en pratique pas possible de retrouver des informations à ton sujet (article 11 du RGPD).\",\"Pour toute question, écris à {email}. Tu peux aussi adresser une réclamation à la [CNIL](https://www.cnil.fr/fr/plaintes).\"]},{\"title\":\"Modifications\",\"blocks\":[\"Si le fonctionnement du site change, par exemple avec l’ajout d’une mesure d’audience, cette page sera mise à jour avant la mise en service.\"]}]},\"accessibility\":{\"title\":\"Accessibilité\",\"description\":\"Déclaration d’accessibilité de {domain} : état de conformité au RGAA, résultats des tests et contact.\",\"updated\":\"Dernière mise à jour : 21 novembre 2026\",\"sections\":[{\"title\":\"Engagement\",\"blocks\":[\"L’éditeur s’efforce de rendre {domain} accessible à toutes et à tous, en suivant le référentiel général d’amélioration de l’accessibilité ([RGAA 4.1.2](https://accessibilite.numerique.gouv.fr/)). Un site personnel n’y est pas obligé par la loi : c’est un choix.\"]},{\"title\":\"État de conformité\",\"blocks\":[\"{domain} est partiellement conforme au RGAA 4.1.2. Aucun audit complet n’a encore été réalisé par un organisme indépendant : les résultats ci-dessous viennent d’une auto-évaluation.\"]},{\"title\":\"Résultats des tests\",\"blocks\":[\"Auto-évaluation réalisée en novembre 2026 sur les pages types : accueil, jeu, page d’un débat, liste des débats, catégorie, Hall of Fame et pages d’information. Points vérifiés :\",[\"audit automatique avec axe-core sur chaque page type, sans erreur restante ;\",\"navigation complète au clavier, avec un focus toujours visible ; le jeu se joue aussi avec les flèches ;\",\"contrastes des textes et des composants ;\",\"structure des titres, langue de la page, liens d’évitement et intitulés des boutons ;\",\"respect du réglage « réduire les animations » du système, et interrupteur d’animations sur chaque page, qui fige aussi les GIF ;\",\"affichage jusqu’à 360 pixels de large et zoom à 200 %.\"]]},{\"title\":\"Contenus non accessibles\",\"blocks\":[[\"Les GIF sont décoratifs et ne sont pas décrits : ils illustrent la team, dont le nom est toujours écrit et annoncé à côté.\",\"Les tests avec des lecteurs d’écran (NVDA, VoiceOver) n’ont pas encore été menés.\"]]},{\"title\":\"Établissement de cette déclaration\",\"blocks\":[[\"Déclaration établie le 21 novembre 2026.\",\"Technologies utilisées : HTML, CSS et JavaScript.\",\"Outils : axe-core, Lighthouse, Playwright (Chromium) et navigation au clavier.\"]]},{\"title\":\"Retour d’information et contact\",\"blocks\":[\"Si tu n’arrives pas à accéder à un contenu ou à un service, écris à {email} : une solution te sera proposée.\"]},{\"title\":\"Voies de recours\",\"blocks\":[\"Si tu as signalé un défaut d’accessibilité sans obtenir de réponse satisfaisante, tu peux saisir le [Défenseur des droits](https://formulaire.defenseurdesdroits.fr/), ou lui écrire gratuitement, sans affranchissement : Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07.\"]}]},\"about\":{\"title\":\"À propos\",\"description\":\"484, c’est un jeu de débats : {rivalries} rivalités « Team X ou team Y ? » écrites à la main, et le pourcentage des autres visiteurs après chaque vote.\",\"updated\":\"Dernière mise à jour : 21 novembre 2026\",\"sections\":[{\"title\":\"Le principe\",\"blocks\":[\"484 · Lequel tu préfères ? pose des questions sans importance, mais très sérieusement. Batman ou Superman ? Pain au chocolat ou chocolatine ? [Team Edward ou team Jacob ?](/debat/ecrans-edward-jacob) Tu choisis ton camp, et tu découvres aussitôt quel pourcentage des visiteurs a fait le même choix que toi.\"]},{\"title\":\"Les rivalités\",\"blocks\":[\"Le site compte {rivalries} rivalités écrites et relues à la main, réparties en {categories} catégories et {universes} univers : les écrans, la pop culture, la vraie vie et l’imaginaire. Elles sont toutes rangées dans [la liste des débats](/debats).\",\"La règle : pas de méchanceté, pas de vulgarité. On se moque des débats, jamais des gens.\"]},{\"title\":\"Les pourcentages\",\"blocks\":[\"Chaque vote est compté de façon anonyme : un compteur par rivalité, rien de plus. Les pourcentages affichés sont ceux de tous les visiteurs depuis l’ouverture du site.\",\"Les débats les plus serrés, les plus écrasants et les plus votés sont classés dans le [Hall of Fame](/hall-of-fame).\"]},{\"title\":\"Partager un débat\",\"blocks\":[\"Chaque débat a sa propre adresse : le bouton de partage l’envoie à qui tu veux, et ton ami tombe directement sur la même question.\"]},{\"title\":\"Qui est derrière ?\",\"blocks\":[\"Un développeur web qui aurait pu faire un portfolio sérieux, et qui a préféré ça. Ses autres projets sont [par ici](/projets). Une idée de rivalité, une remarque ? Écris à {email}.\"]}]}}"),
	og: { "cta": "Choisis ton camp sur {domain}" },
	breadcrumb: {
		"label": "Fil d’Ariane",
		"home": "Accueil",
		"debates": "Tous les débats"
	},
	debatesPage: {
		"title": "Tous les débats",
		"description": "{rivalries} rivalités « Team X ou team Y ? » rangées par catégorie : héros, bouffe, jeux vidéo, musique, autos, animaux… Choisis ton terrain.",
		"intro": "{rivalries} rivalités, rangées en {categories} catégories. Choisis ton terrain, ou laisse le hasard décider.",
		"mixed": "Tout mélanger →",
		"count": {
			"one": "{n} débat",
			"other": "{n} débats"
		}
	},
	categoryPage: {
		"title": "{category} : tous les débats",
		"description": "{n} rivalités « Team X ou team Y ? » dans la catégorie {category}. {tagline}",
		"play": "Jouer cette catégorie →",
		"listTitle": "Les {n} débats",
		"others": "Dans le même univers : {universe}"
	},
	debateAbout: {
		"related": "Autres débats : {category}",
		"categoryLink": "Les {n} débats « {category} » →"
	},
	llms: {
		"intro": "Jeu de débats en français : chaque page pose une question « Team X ou team Y ? » sur la pop culture, la bouffe, le sport ou la vie quotidienne. Le visiteur choisit son camp et découvre le pourcentage des autres visiteurs. Toutes les rivalités sont écrites à la main, sur un ton drôle mais jamais méchant.",
		"pagesTitle": "Pages principales",
		"categoriesTitle": "Catégories",
		"infoTitle": "Informations",
		"debatesCount": "{n} débats"
	}
};
/** Espaces qu'on remplace : espace normale, insécable, fine insécable, fine. */
var SPACES = "[ \\u00A0\\u202F\\u2009]";
var URL_PATTERN = /https?:\/\/\S+/g;
function fixSegment(text) {
	return text.replace(/'/g, "’").replace(new RegExp(`«${SPACES}*`, "g"), `« `).replace(new RegExp(`${SPACES}*»`, "g"), ` »`).replace(new RegExp(`(?<=\\S)${SPACES}*([;:!?]+)`, "g"), (match, punct, offset, whole) => {
		const before = whole[offset - 1] ?? "";
		const after = whole[offset + match.length] ?? "";
		if (punct === ":" && match === ":" && /\d/.test(before) && /\d/.test(after)) return match;
		return ` ${punct}`;
	}).replace(new RegExp(`(?<=\\bn°)${SPACES}+`, "g"), "\xA0").replace(new RegExp(`(?<=[\\d}])${SPACES}*%`, "g"), ` %`);
}
/** Applique les règles de typographie française à un texte. */
function frenchTypography(text) {
	let result = "";
	let cursor = 0;
	for (const match of text.matchAll(URL_PATTERN)) {
		const start = match.index;
		result += fixSegment(text.slice(cursor, start)) + match[0];
		cursor = start + match[0].length;
	}
	return result + fixSegment(text.slice(cursor));
}
/**
* Applique `frenchTypography` à toutes les chaînes d'une structure JSON,
* sauf aux valeurs des clés listées (identifiants, URL, requêtes techniques…).
*/
function applyTypographyDeep(value, skipKeys) {
	const walk = (node) => {
		if (typeof node === "string") return frenchTypography(node);
		if (Array.isArray(node)) return node.map(walk);
		if (node !== null && typeof node === "object") return Object.fromEntries(Object.entries(node).map(([key, child]) => [key, skipKeys.has(key) ? child : walk(child)]));
		return node;
	};
	return walk(value);
}
// src/engine/achievements.ts
var ACHIEVEMENT_KINDS = [
	"debates",
	"rebels",
	"categories",
	"universes",
	"streak"
];
var count = z.number().int().nonnegative();
z.object({
	version: z.literal(1),
	category: z.string(),
	queue: z.array(z.string()),
	current: z.string(),
	count,
	history: z.array(z.object({
		rivalryId: z.string(),
		team: z.enum([
			"a",
			"b",
			"none"
		]),
		percent: z.number().min(0).max(100).nullable()
	})),
	measured: count,
	agreed: count,
	rebels: count,
	categories: z.array(z.string()).default([]),
	streak: count.default(0),
	bestStreak: count.default(0),
	lastQuipKey: z.string().nullable()
});
var ICON_NAMES = Object.keys({
	bolt: faBolt,
	briefcase: faBriefcase,
	"car-side": faCarSide,
	clapperboard: faClapperboard,
	comments: faComments,
	"compact-disc": faCompactDisc,
	compass: faCompass,
	crown: faCrown,
	dragon: faDragon,
	"earth-europe": faEarthEurope,
	eye: faEye,
	film: faFilm,
	fire: faFire,
	futbol: faFutbol,
	gamepad: faGamepad,
	guitar: faGuitar,
	"hand-fist": faHandFist,
	hashtag: faHashtag,
	heart: faHeart,
	house: faHouse,
	"laptop-code": faLaptopCode,
	lock: faLock,
	mask: faMask,
	medal: faMedal,
	"mug-hot": faMugHot,
	paw: faPaw,
	"people-group": faPeopleGroup,
	"pizza-slice": faPizzaSlice,
	"scale-balanced": faScaleBalanced,
	shirt: faShirt,
	shuffle: faShuffle,
	star: faStar,
	trophy: faTrophy,
	tv: faTv,
	"user-group": faUserGroup,
	video: faVideo,
	"wand-magic-sparkles": faWandMagicSparkles
});
// src/server/gif-links.ts
var TENOR_HOST = /^media\d*\.tenor\.com$/;
var TENOR_PATH = /^\/(?:m\/)?([A-Za-z0-9_-]{11})[A-Za-z0-9_-]{5}\/([^/]+?)\.(gif|mp4|webp|png)$/;
function tenorParts(url) {
	let parsed;
	try {
		parsed = new URL(url);
	} catch {
		return null;
	}
	if (parsed.protocol !== "https:" || !TENOR_HOST.test(parsed.hostname)) return null;
	if (parsed.search || parsed.hash) return null;
	const match = TENOR_PATH.exec(parsed.pathname);
	if (!match) return null;
	return {
		base: match[1],
		name: match[2]
	};
}
/** Le lien est-il une image Tenor utilisable ? */
function isTenorUrl(url) {
	return tenorParts(url) !== null;
}
/** Identifiant d'un GIF Tenor, sous la même forme que ceux de Giphy (lettres et chiffres). */
function tenorGifId(url) {
	const parts = tenorParts(url);
	return parts ? `tenor${parts.base.replace(/[^A-Za-z0-9]/g, "")}` : null;
}
/** Les versions légères d'un GIF Tenor, au format renvoyé par /api/gif. */
function tenorGif(url) {
	const parts = tenorParts(url);
	if (!parts) return null;
	const at = (format, ext) => `https://media.tenor.com/${parts.base}${format}/${parts.name}.${ext}`;
	return {
		id: tenorGifId(url),
		mp4: at("AAAPo", "mp4"),
		webp: at("AAAAx", "webp"),
		still: at("AAAAe", "png"),
		width: 0,
		height: 0
	};
}
/** Dossier public des images de teams (adresse vue par le navigateur). */
var TEAM_IMAGES_DIR = "/images/teams/";
var TEAM_IMAGE = /^\/images\/teams\/([a-z0-9-]+-([0-9a-f]{8}))(\.anim)?\.webp$/;
/** Le chemin est-il une image de team rangée sur le site ? */
function isTeamImage(path) {
	return TEAM_IMAGE.test(path);
}
/** Une image de team, au format renvoyé par /api/gif : pas de vidéo, l'image et son aperçu fixe. */
function teamImage(path) {
	const match = TEAM_IMAGE.exec(path);
	if (!match) return null;
	return {
		id: `img${match[2]}`,
		mp4: "",
		webp: path,
		still: `${TEAM_IMAGES_DIR}${match[1]}.webp`,
		width: 0,
		height: 0
	};
}
// src/lib/inline.ts
/** Lien `[libellé](adresse)` : adresse interne ou https, sans espace. */
var LINK = /\[([^\]]+)\]\(((?:\/|#|https:\/\/)[^\s)]*)\)/g;
var VARIABLE = /\{(\w+)\}/g;
/** Variables utilisées dans un texte (pour la validation du contenu). */
function inlineVariables(text) {
	return [...text.matchAll(VARIABLE)].map((m) => m[1] ?? "");
}
/** Libellés entre crochets qui ne forment pas un lien valide (adresse absente ou non autorisée). */
function brokenLinks(text) {
	return [...text.replace(LINK, "").matchAll(/\[([^\]]*)\]/g)].map((m) => m[0]);
}
// src/data/schema.ts
/**
* Schémas Zod des fichiers de `content/`. Ils sont vérifiés au build :
* une erreur dans un JSON fait échouer le build avec un message lisible.
*/
/** Nom d'une icône intégrée (voir src/lib/icons.ts). */
var icon = z.enum(ICON_NAMES, { message: `icône inconnue ; icônes disponibles : ${ICON_NAMES.join(", ")}` });
var slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "doit être en minuscules, chiffres et tirets (ex. « heros-batman-superman »)");
var text = z.string().trim().min(1, "ne doit pas être vide");
var ThemeSchema = z.object({
	id: slug.refine((id) => id !== "mix", `« mix » est réservé à « Tout mélangé »`),
	label: text,
	tagline: text,
	icon,
	/**
	* GIF d'ambiance, en dernier recours pour une team sans GIF fiable : recherche générique
	* en anglais (« difficult choice »), ou GIF choisis à la main.
	*/
	giphyQuery: text,
	giphyIds: z.array(text).optional()
});
/** Une team (un camp d'une rivalité). L'origine est libre : une chocolatine n'a pas d'année de sortie. */
var TeamSchema = z.object({
	name: text.max(60, "doit rester court (60 caractères maximum)"),
	origin: text.max(80, "doit rester courte (80 caractères maximum)"),
	line: text.max(120, "doit rester courte (120 caractères maximum)"),
	giphyIds: z.array(text),
	giphyQuery: text,
	/**
	* Mots-clés qui valident un résultat de recherche Giphy (titre, slug ou auteur, sans accents
	* ni casse). Absents : le nom de la team et `giphyQuery` (voir src/server/gif-match.ts).
	*/
	giphyKeywords: z.array(text).min(1, "mettre au moins un mot-clé, ou retirer le champ").optional(),
	/**
	* GIF choisis à la main par un lien Tenor (`https://media.tenor.com/…`), quand Giphy n'a rien
	* de bon. Tirés au sort avec les `giphyIds` (voir src/server/gif-links.ts).
	*/
	gifUrls: z.array(z.string().refine(isTenorUrl, "lien Tenor attendu, de la forme https://media.tenor.com/…/nom.gif (clic droit sur le GIF, « Copier l’adresse de l’image »)")).min(1, "mettre au moins un lien, ou retirer le champ").optional(),
	/**
	* Images rangées sur le site (`/images/teams/…webp`), importées par la page de curation quand
	* ni Giphy ni Tenor n'ont rien. Tirées au sort avec les autres GIF choisis à la main.
	*/
	images: z.array(z.string().refine(isTeamImage, "image attendue, de la forme /images/teams/nom-1a2b3c4d.webp (à importer avec npm run gif-audit)")).min(1, "mettre au moins une image, ou retirer le champ").optional()
});
var RivalrySchema = z.object({
	id: slug,
	category: slug,
	/** Question sur mesure ; sinon « Team A ou team B ? ». */
	question: text.max(120, "doit rester courte (120 caractères maximum)").optional(),
	a: TeamSchema,
	b: TeamSchema
});
var pairKey = (a, b) => [a, b].map((n) => n.trim().toLowerCase()).sort().join(" | ");
/** Un univers regroupe plusieurs catégories (« Écrans », « Pop culture »…). */
var UniverseSchema = z.object({
	id: slug.refine((id) => id !== "mix", `« mix » est réservé à « Tout mélangé »`),
	label: text,
	tagline: text,
	icon,
	categories: z.array(slug).min(1, "un univers doit contenir au moins une catégorie")
});
var RivalriesFileSchema = z.object({
	version: z.literal(1),
	universes: z.array(UniverseSchema).min(1),
	categories: z.array(ThemeSchema).min(1),
	rivalries: z.array(RivalrySchema)
}).superRefine((file, ctx) => {
	const categoryIds = /* @__PURE__ */ new Set();
	file.categories.forEach((category, i) => {
		if (categoryIds.has(category.id)) ctx.addIssue({
			code: "custom",
			path: [
				"categories",
				i,
				"id"
			],
			message: `catégorie en double : ${category.id}`
		});
		categoryIds.add(category.id);
	});
	const universeOf = /* @__PURE__ */ new Map();
	const universeIds = /* @__PURE__ */ new Set();
	file.universes.forEach((universe, i) => {
		if (universeIds.has(universe.id) || categoryIds.has(universe.id)) ctx.addIssue({
			code: "custom",
			path: [
				"universes",
				i,
				"id"
			],
			message: `identifiant d’univers déjà utilisé : ${universe.id}`
		});
		universeIds.add(universe.id);
		universe.categories.forEach((category, j) => {
			if (!categoryIds.has(category)) ctx.addIssue({
				code: "custom",
				path: [
					"universes",
					i,
					"categories",
					j
				],
				message: `catégorie inconnue dans l’univers « ${universe.id} » : ${category}`
			});
			else if (universeOf.has(category)) ctx.addIssue({
				code: "custom",
				path: [
					"universes",
					i,
					"categories",
					j
				],
				message: `la catégorie « ${category} » est déjà dans l’univers « ${universeOf.get(category)} »`
			});
			universeOf.set(category, universe.id);
		});
	});
	file.categories.forEach((category, i) => {
		if (!universeOf.has(category.id)) ctx.addIssue({
			code: "custom",
			path: [
				"categories",
				i,
				"id"
			],
			message: `la catégorie « ${category.id} » n’est dans aucun univers`
		});
	});
	const ids = /* @__PURE__ */ new Set();
	const pairs = /* @__PURE__ */ new Map();
	const perCategory = /* @__PURE__ */ new Map();
	file.rivalries.forEach((rivalry, i) => {
		const at = (...path) => [
			"rivalries",
			i,
			...path
		];
		if (ids.has(rivalry.id)) ctx.addIssue({
			code: "custom",
			path: at("id"),
			message: `identifiant en double : ${rivalry.id}`
		});
		ids.add(rivalry.id);
		if (!categoryIds.has(rivalry.category)) ctx.addIssue({
			code: "custom",
			path: at("category"),
			message: `catégorie inconnue : ${rivalry.category}`
		});
		else if (!rivalry.id.startsWith(`${rivalry.category}-`)) ctx.addIssue({
			code: "custom",
			path: at("id"),
			message: `l’identifiant doit commencer par « ${rivalry.category}- »`
		});
		const key = pairKey(rivalry.a.name, rivalry.b.name);
		if (rivalry.a.name.trim().toLowerCase() === rivalry.b.name.trim().toLowerCase()) ctx.addIssue({
			code: "custom",
			path: at("b", "name"),
			message: "les deux teams ont le même nom"
		});
		else if (pairs.has(key)) ctx.addIssue({
			code: "custom",
			path: at("id"),
			message: `rivalité déjà présente : ${pairs.get(key)}`
		});
		pairs.set(key, rivalry.id);
		perCategory.set(rivalry.category, (perCategory.get(rivalry.category) ?? 0) + 1);
	});
	file.categories.forEach((category, i) => {
		const count = perCategory.get(category.id) ?? 0;
		if (count < 3) ctx.addIssue({
			code: "custom",
			path: ["categories", i],
			message: `la catégorie « ${category.id} » a ${count} rivalité(s), il en faut au moins 3`
		});
	});
});
/** Un texte qui doit contenir certains marqueurs, par exemple `{name}`. */
var template = (...placeholders) => placeholders.reduce((schema, p) => schema.refine((value) => value.includes(`{${p}}`), `doit contenir le marqueur {${p}}`), text);
/** Une liste de remarques : au moins deux, pour ne jamais répéter deux fois de suite. */
var quipList = z.array(text).min(2, "il faut au moins 2 remarques pour éviter les répétitions");
/** Lien externe facultatif : une URL vide masque le lien (ex. LinkedIn pas encore renseigné). */
var optionalLink = z.object({
	label: text,
	url: z.union([z.url(), z.literal("")])
});
var pluralForms = z.object({
	one: text,
	other: template("n")
});
/** Variables utilisables dans les pages d'information (voir src/lib/inline.ts). */
var PROSE_VARIABLES = [
	"email",
	"domain",
	"rivalries",
	"categories",
	"universes"
];
/** Texte long : liens `[libellé](adresse)` internes ou https, et variables connues seulement. */
var proseText = text.superRefine((value, ctx) => {
	for (const broken of brokenLinks(value)) ctx.addIssue({
		code: "custom",
		message: `lien mal formé : ${broken} (attendu : [libellé](/page) ou [libellé](https://…))`
	});
	for (const name of inlineVariables(value)) if (!PROSE_VARIABLES.includes(name)) ctx.addIssue({
		code: "custom",
		message: `variable inconnue : {${name}} ; variables possibles : ${PROSE_VARIABLES.join(", ")}`
	});
});
/** Page d'information : sections faites de paragraphes (texte) et de listes (tableau de textes). */
var prosePage = z.object({
	title: text,
	description: proseText,
	updated: text,
	sections: z.array(z.object({
		title: text,
		blocks: z.array(z.union([proseText, z.array(proseText).min(1)])).min(1)
	})).min(1)
});
var UiTextsSchema = z.object({
	site: z.object({
		title: text,
		description: text,
		logo: text,
		name: text,
		socialLabel: text,
		motion: z.object({
			label: text,
			on: text,
			off: text
		}),
		skipToContent: text,
		toc: text,
		email: z.email("adresse email invalide"),
		domain: text
	}),
	links: z.object({
		github: optionalLink,
		linkedin: optionalLink
	}),
	home: z.object({
		title: z.tuple([
			text,
			text,
			text
		]),
		intro: text,
		footnote: text,
		mixedTheme: z.object({
			label: text,
			tagline: text,
			icon
		}),
		themesLabel: text,
		play: text,
		playUniverse: text
	}),
	debate: z.object({
		pageTitle: text,
		number: template("n"),
		subtitle: text,
		question: template("a", "b"),
		categoriesLabel: text,
		universesLabel: text,
		wholeUniverse: text,
		team: text,
		vs: text,
		skip: text,
		/** « Aucun des deux » : 3e choix, compté comme un débat tranché. */
		none: z.object({
			button: text,
			choice: text,
			label: text,
			between: template("a", "b"),
			split: template("percent")
		}),
		keysHint: text,
		pickHint: text,
		loading: text,
		noscript: text,
		choice: template("name"),
		share: template("percent"),
		firstVote: text,
		milestoneLink: text,
		teams: z.object({
			title: text,
			empty: text,
			versus: template("name")
		}),
		profile: z.object({
			title: text,
			count: pluralForms,
			agreement: template("percent"),
			agreementUnknown: text,
			rebels: pluralForms
		}),
		hallLink: text,
		shareButton: text,
		shareCopied: text,
		shareText: template("a", "b"),
		shareDescription: template("a", "b"),
		loadError: text,
		/** Bouton « Mauvais GIF ? » sous chaque carte. */
		gifReport: z.object({
			button: text,
			/** Nom accessible : commence par le texte visible (WCAG 2.5.3). */
			label: template("name"),
			thanks: quipList,
			limited: text,
			error: text,
			/** Mode admin : le GIF est écarté et remplacé sous tes yeux. */
			admin: text
		})
	}),
	quips: z.object({
		high: quipList,
		mid: quipList,
		low: quipList,
		neutral: quipList
	}),
	/** Achievements : objectifs à débloquer (voir src/engine/achievements.ts). */
	achievements: z.object({
		title: text,
		unlocked: text,
		count: template("done", "total"),
		next: template("name", "left"),
		allDone: text,
		locked: text,
		list: z.array(z.object({
			id: slug,
			kind: z.enum(ACHIEVEMENT_KINDS, { message: `type inconnu ; types possibles : ${ACHIEVEMENT_KINDS.join(", ")}` }),
			goal: z.number().int().positive("l’objectif doit être un nombre positif"),
			icon,
			name: text.max(40, "doit rester court (40 caractères maximum)"),
			description: text,
			/** Phrase du bandeau de déblocage. */
			text,
			/** Affiche le lien LinkedIn dans le bandeau. */
			link: z.boolean().optional()
		})).min(1).superRefine((list, ctx) => {
			const seen = /* @__PURE__ */ new Set();
			list.forEach((a, i) => {
				if (seen.has(a.id)) ctx.addIssue({
					code: "custom",
					path: [i, "id"],
					message: `achievement en double : ${a.id}`
				});
				seen.add(a.id);
			});
		})
	}),
	hallOfFame: z.object({
		pageTitle: text,
		title: text,
		intro: text,
		totalVotes: pluralForms,
		filterLabel: text,
		popularTitle: text,
		popularIntro: text,
		podium: z.tuple([
			text,
			text,
			text
		]),
		closeTitle: text,
		closeIntro: text,
		landslideTitle: text,
		landslideIntro: text,
		votes: pluralForms,
		/** Part « aucun des deux » d'un débat. */
		none: template("percent"),
		empty: text,
		emptySection: text,
		loading: text,
		error: text,
		play: text
	}),
	notFound: z.object({
		pageTitle: text,
		code: text,
		title: text,
		text,
		back: text
	}),
	footer: z.object({
		projects: text,
		hallOfFame: text,
		disclaimer: text,
		/** Numéro de version (celui de package.json). */
		version: template("version"),
		giphy: z.object({
			label: text,
			url: z.url()
		}),
		/** Affiché seulement si des GIF viennent de Tenor. */
		tenor: z.object({
			label: text,
			url: z.url()
		}),
		legal: z.object({
			label: text,
			debates: text,
			about: text,
			mentions: text,
			privacy: text,
			accessibility: text
		})
	}),
	pages: z.object({
		mentions: prosePage,
		privacy: prosePage,
		accessibility: prosePage,
		about: prosePage
	}),
	projectsPage: z.object({
		title: text,
		intro: text,
		back: text
	}),
	og: z.object({ cta: template("domain") }),
	breadcrumb: z.object({
		label: text,
		home: text,
		debates: text
	}),
	llms: z.object({
		intro: text,
		pagesTitle: text,
		categoriesTitle: text,
		infoTitle: text,
		debatesCount: template("n")
	}),
	debatesPage: z.object({
		title: text,
		description: template("rivalries"),
		intro: template("rivalries", "categories"),
		mixed: text,
		count: pluralForms
	}),
	categoryPage: z.object({
		title: template("category"),
		description: template("n", "category", "tagline"),
		play: text,
		listTitle: template("n"),
		others: template("universe")
	}),
	debateAbout: z.object({
		related: template("category"),
		categoryLink: template("n", "category")
	}),
	projects: z.array(z.object({
		kind: text,
		title: text,
		text,
		url: z.url(),
		cta: text
	}))
});
// src/data/parse.ts
/**
* Validation + typographie des contenus. Indépendant de Vite et de Node :
* reçoit les objets JSON bruts, renvoie des contenus sûrs et typés.
*/
/** Clés dont les valeurs ne sont pas du texte affiché : jamais retouchées. */
var TECHNICAL_KEYS = /* @__PURE__ */ new Set([
	"id",
	"theme",
	"category",
	"icon",
	"email",
	"domain",
	"url",
	"giphyIds",
	"giphyQuery",
	"giphyKeywords",
	"gifUrls",
	"images",
	"kind",
	"version"
]);
var ContentError = class extends Error {
	constructor(file, error) {
		super(`Contenu invalide dans ${file} :\n${z.prettifyError(error)}`);
		this.name = "ContentError";
	}
};
function validate(schema, raw, file) {
	const result = schema.safeParse(raw);
	if (!result.success) throw new ContentError(file, result.error);
	return result.data;
}
/** Valide `content/ui-texts.fr.json` et applique la typographie française à ses textes. */
function parseUi(raw) {
	return applyTypographyDeep(validate(UiTextsSchema, raw, "content/ui-texts.fr.json"), TECHNICAL_KEYS);
}
/** Valide `content/rivalries.json` et applique la typographie française à ses textes. */
function parseRivalries(raw) {
	return applyTypographyDeep(validate(RivalriesFileSchema, raw, "content/rivalries.json"), TECHNICAL_KEYS);
}
// src/data/content.ts
/**
* Point d'entrée des contenus pour le site. Importé par les pages Astro :
* si un JSON est invalide, le build échoue ici.
*/
var ui = parseUi(ui_texts_fr_default);
var { universes, categories, rivalries } = parseRivalries(rivalries_default);
// \0virtual:astro:env/internal
var schema = {
	"GIPHY_API_KEY": {
		"context": "server",
		"access": "secret",
		"optional": true,
		"type": "string"
	},
	"GIF_CACHE_FILE": {
		"context": "server",
		"access": "secret",
		"default": "data/gif-cache.json",
		"type": "string"
	},
	"OG_CACHE_DIR": {
		"context": "server",
		"access": "secret",
		"default": "data/og",
		"type": "string"
	},
	"VOTE_HASH_SALT": {
		"context": "server",
		"access": "secret",
		"optional": true,
		"type": "string"
	},
	"VOTES_DB_FILE": {
		"context": "server",
		"access": "secret",
		"default": "data/votes.sqlite",
		"type": "string"
	},
	"GIF_REPORT_TOKEN": {
		"context": "server",
		"access": "secret",
		"optional": true,
		"type": "string"
	},
	"TRUST_PROXY": {
		"context": "server",
		"access": "secret",
		"default": "false",
		"type": "string"
	}
};
// \0astro:env/server
/** @returns {string} */
var getEnv = (key) => {
	return getEnv$1(key);
};
var getSecret = (key) => {
	return getEnv(key);
};
var _internalGetSecret = (key) => {
	const rawVariable = getEnv(key);
	const variable = rawVariable === "" ? void 0 : rawVariable;
	const options = schema[key];
	const result = validateEnvVariable(variable, options);
	if (result.ok) return result.value;
	const type = getEnvFieldType(options);
	throw createInvalidVariablesError(key, type, result);
};
setOnSetGetEnv(() => {
	GIPHY_API_KEY = _internalGetSecret("GIPHY_API_KEY");
	GIF_CACHE_FILE = _internalGetSecret("GIF_CACHE_FILE");
	OG_CACHE_DIR = _internalGetSecret("OG_CACHE_DIR");
	VOTE_HASH_SALT = _internalGetSecret("VOTE_HASH_SALT");
	VOTES_DB_FILE = _internalGetSecret("VOTES_DB_FILE");
	GIF_REPORT_TOKEN = _internalGetSecret("GIF_REPORT_TOKEN");
	TRUST_PROXY = _internalGetSecret("TRUST_PROXY");
});
var GIPHY_API_KEY = _internalGetSecret("GIPHY_API_KEY");
var GIF_CACHE_FILE = _internalGetSecret("GIF_CACHE_FILE");
var OG_CACHE_DIR = _internalGetSecret("OG_CACHE_DIR");
var VOTE_HASH_SALT = _internalGetSecret("VOTE_HASH_SALT");
var VOTES_DB_FILE = _internalGetSecret("VOTES_DB_FILE");
var GIF_REPORT_TOKEN = _internalGetSecret("GIF_REPORT_TOKEN");
var TRUST_PROXY = _internalGetSecret("TRUST_PROXY");
export { universes as a, ui as i, categories as n, teamImage as o, rivalries as r, tenorGif as s, getSecret as t };
