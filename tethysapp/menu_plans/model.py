import sqlite3
import os
import uuid
import json
from django.http import JsonResponse, Http404, HttpResponse
from app import MenuPlans as app

def create_database():
    #run manually

    app_ws = app.get_app_workspace().path
    sqlite_file = os.path.join(app_ws, 'menuplan.sqlite')
    conn = sqlite3.connect(sqlite_file)
    c = conn.cursor()

    # Dish sqlite DB
    dishtable = 'dish' # name of the table
    dishcolumns = [
        ['name', 'string'],
        ['dish_type', 'string'],
        ['serves', 'integer'],
        ['prep', 'integer'],
        ['cook', 'integer'],
        ['rating', 'float'],
        ['nutritionid', 'integer'],
        ['ingredientid', 'integer'],
        ['directionid', 'integer'],
    ]

    exe = "CREATE TABLE {} (".format(dishtable)

    exe = exe + '{nf} {ft} PRIMARY KEY'.format(nf='id', ft='string')
    for column in dishcolumns:
        exe = exe + ', {nf} {ft}'.format(nf=column[0], ft=column[1])
    exe = exe + ")"

    c.execute(exe)

    nutritiontable = 'nutrition' # name of the table
    nutcolumns = [
        ['calories', 'float'],
        ['carbohydrates', 'float'],
        ['saturated_fat', 'float'],
        ['total_fat', 'float'],
        ['sugar', 'float'],
        ['protein', 'float'],
        ['cholesterol', 'float'],
        ['sodium', 'float']
    ]

    exe = 'CREATE TABLE {} ('.format(nutritiontable)

    exe = exe + '{nf} {ft} PRIMARY KEY'.format(nf='id', ft='string')
    for column in nutcolumns:
        exe = exe + ', {nf} {ft}'.format(nf=column[0], ft=column[1])
    exe = exe + (', FOREIGN KEY({}) REFERENCES {}({}{})'.format(column[0], dishtable, nutritiontable, 'id'))
    exe = exe + ")"

    c.execute(exe)

    ingredienttable = 'ingredient' # name of the table
    ingcolumns = [
        ['ingredientid', 'string'],
        ['step', 'integer'],
        ['ingredient', 'string'],
    ]

    exe = 'CREATE TABLE {} ('.format(ingredienttable)

    exe = exe + '{nf} {ft} PRIMARY KEY AUTOINCREMENT'.format(nf='id', ft='integer')
    for column in ingcolumns:
        exe = exe + ', {nf} {ft}'.format(nf=column[0], ft=column[1])
    exe = exe + (', FOREIGN KEY({}) REFERENCES {}({}{})'.format(column[0], dishtable, ingredienttable, 'id'))
    exe = exe + ")"

    c.execute(exe)

    directiontable = 'direction' # name of the table
    dircolumns = [
        ['directionid', 'string'],
        ['step', 'integer'],
        ['direction', 'string'],
    ]

    exe = 'CREATE TABLE {} ('.format(directiontable)

    exe = exe + '{nf} {ft} PRIMARY KEY AUTOINCREMENT'.format(nf='id', ft='integer')
    for column in dircolumns:
        exe = exe + ', {nf} {ft}'.format(nf=column[0], ft=column[1])
    exe = exe + (', FOREIGN KEY({}) REFERENCES {}({}{})'.format(column[0], dishtable, directiontable, 'id'))
    exe = exe + ")"

    c.execute(exe)

    conn.commit()
    conn.close()

def insert_picture(conn, picture_file):
    with open(picture_file, 'rb') as input_file:
        ablob = input_file.read()
        base=os.path.basename(picture_file)
        afile, ext = os.path.splitext(base)
        sql = '''INSERT INTO PICTURES
        (PICTURE, TYPE, FILE_NAME)
        VALUES(?, ?, ?);'''
        conn.execute(sql,[sqlite3.Binary(ablob), ext, afile])
        conn.commit()

def create_meal(request):
    app_ws = app.get_app_workspace().path
    sqlite_file = os.path.join(app_ws, 'menuplan.sqlite')
    if not os.path.isfile(sqlite_file):
        create_database()

    db_id = request.POST.get('db_id')
    if db_id == 'none':
        db_id = None

    dish_name = request.POST.get('dish_name')
    dish_type = request.POST.get('dish_type')
    serves = request.POST.get('serves')
    prep = request.POST.get('prep')
    cook = request.POST.get('cook')
    rating = request.POST.get('rating')
    meal = Meal(dish_name, dish_type, serves, prep, cook, rating)

    calories = request.POST.get('cal')
    carbs = request.POST.get('carb')
    saturated_fat = request.POST.get('satfat')
    total_fat = request.POST.get('totfat')
    sugar = request.POST.get('sugar')
    protein = request.POST.get('protein')
    cholestoral = request.POST.get('chol')
    sodium = request.POST.get('sodium')
    image = request.FILES.get('image')

    meal.nutrition = Nutrition(calories=calories, total_fat=total_fat, carbs=carbs, protein=protein, sat_fat=saturated_fat, sodium=sodium, sugar=sugar, chol=cholestoral)
    meal.ingredient = Ingredient()
    meal.direction = Direction()

    ingredients = json.loads(request.POST.get('ingredients'))

    for ingredient in ingredients:
        meal.ingredient.add_ingredient(ingredient, ingredients[ingredient])

    directions = json.loads(request.POST.get('directions'))

    for direction in directions:
        meal.direction.add_direction(direction, directions[direction])

    meal.save_to_db(db_id)
    return JsonResponse({'success':True})

def get_all_dishes(request):
    app_ws = app.get_app_workspace().path
    sqlite_file = os.path.join(app_ws, 'menuplan.sqlite')
    conn = sqlite3.connect(sqlite_file)
    cur = conn.cursor()
    cur.execute("SELECT id, name, rating FROM dish")

    rows = cur.fetchall()

    return JsonResponse({'success': True, 'data': rows})

def get_dish(request):
    id = request.POST.get('id')

    response_dict = {'success': True}

    app_ws = app.get_app_workspace().path
    sqlite_file = os.path.join(app_ws, 'menuplan.sqlite')
    conn = sqlite3.connect(sqlite_file)

    sql = 'SELECT * FROM dish WHERE id=?'
    cur = conn.cursor()
    cur.execute(sql, (id,))
    rows = cur.fetchone()
    response_dict['dish'] = rows

    sql = 'SELECT * FROM nutrition WHERE id=?'
    cur = conn.cursor()
    cur.execute(sql, (id,))
    rows = cur.fetchone()
    response_dict['nutrition'] = rows

    sql = 'SELECT * FROM ingredient WHERE ingredientid=?'
    cur = conn.cursor()
    cur.execute(sql, (id,))
    rows = cur.fetchall()
    response_dict['ingredient'] = rows

    sql = 'SELECT * FROM direction WHERE directionid=?'
    cur = conn.cursor()
    cur.execute(sql, (id,))
    rows = cur.fetchall()
    response_dict['direction'] = rows

    return JsonResponse(response_dict)

def delete_dish(request):
    id = request.POST.get('id')
    app_ws = app.get_app_workspace().path
    sqlite_file = os.path.join(app_ws, 'menuplan.sqlite')
    conn = sqlite3.connect(sqlite_file)
    sql = 'DELETE FROM dish WHERE id=?'
    cur = conn.cursor()
    cur.execute(sql, (id,))
    conn.commit()
    conn.close()

    return get_all_dishes(request)

class Meal:
    def __init__(self, name, dish_type, serve, prep, cook, rating):
        self.id = None
        self.name = name
        self.dish_type = dish_type
        self.serve = serve
        self.prep = prep
        self.cook = cook
        self.rating = rating
        self.nutrition = None
        self.ingredient = None
        self.direction = None

    def get_id(self):
        if not self.id:
            self.id = uuid.uuid4()

        return self.id

    def add_nutrition(self, calories, total_fat, carbs, protein, sat_fat, sodium, sugar, chol):
        self.nutrition = Nutrition(calories, total_fat, carbs, protein, sat_fat, sodium, sugar, chol)

    def add_ingredients(self):
        self.ingredient = Ingredient()

    def add_directions(self):
        self.direction = Direction()

    def save_to_db(self, db_id):

        app_ws = app.get_app_workspace().path
        sqlite_file = os.path.join(app_ws, 'menuplan.sqlite')
        conn = sqlite3.connect(sqlite_file)

        if not db_id:

            if self.nutrition:
                sql = ''' INSERT INTO nutrition(id,calories,carbohydrates,saturated_fat,total_fat,sugar,protein,cholesterol, sodium)
                              VALUES(?,?,?,?,?,?,?,?,?) '''
                nutrition_inputs = [str(self.get_id()),
                                    self.nutrition.calories,
                                    self.nutrition.carbs,
                                    self.nutrition.sat_fat,
                                    self.nutrition.total_fat,
                                    self.nutrition.sugar,
                                    self.nutrition.protein,
                                    self.nutrition.chol,
                                    self.nutrition.sodium]
                cur = conn.cursor()
                cur.execute(sql, nutrition_inputs)

            ingredient_id = None
            if self.ingredient:
                for key in self.ingredient.ingredients:
                    sql = ''' INSERT INTO ingredient(ingredientid, step, ingredient)
                                  VALUES(?,?,?) '''
                    ingredient_inputs = [str(self.get_id()),
                                         key,
                                         self.ingredient.ingredients[key]]
                    print(key)
                    print(self.ingredient.ingredients)
                    print(ingredient_inputs)
                    cur = conn.cursor()
                    cur.execute(sql, ingredient_inputs)

            if self.direction:
                for key in self.direction.directions:
                    sql = ''' INSERT INTO direction(directionid, step,direction)
                                  VALUES(?,?,?) '''
                    direction_inputs = [str(self.get_id()),
                                        key,
                                        self.direction.directions[key]]
                    cur = conn.cursor()
                    cur.execute(sql, direction_inputs)

            sql = ''' INSERT INTO dish(id,name,dish_type,serves,prep,cook,rating,nutritionid,ingredientid,directionid)
                          VALUES(?,?,?,?,?,?,?,?,?,?) '''
            dish_inputs = [str(self.get_id()),
                           self.name,
                           self.dish_type,
                           self.serve,
                           self.prep,
                           self.cook,
                           self.rating,
                           str(self.get_id()),
                           str(self.get_id()),
                           str(self.get_id())]
            cur = conn.cursor()
            cur.execute(sql, dish_inputs)
            conn.commit()
            conn.close()

        else:

            if self.nutrition:
                sql = ''' UPDATE nutrition SET calories=?,carbohydrates=?,saturated_fat=?,total_fat=?,sugar=?,protein=?,cholesterol=?, sodium=? WHERE id=?'''
                nutrition_inputs = [self.nutrition.calories,
                                    self.nutrition.carbs,
                                    self.nutrition.sat_fat,
                                    self.nutrition.total_fat,
                                    self.nutrition.sugar,
                                    self.nutrition.protein,
                                    self.nutrition.chol,
                                    self.nutrition.sodium,
                                    db_id]
                cur = conn.cursor()
                cur.execute(sql, nutrition_inputs)

            ingredient_id = None
            if self.ingredient:
                for key in self.ingredient.ingredients:
                    sql = ''' UPDATE ingredient SET ingredient=? WHERE ingredientid=? AND step=?'''
                    ingredient_inputs = [self.ingredient.ingredients[key],
                                         db_id,
                                         key
                                         ]
                    cur = conn.cursor()
                    cur.execute(sql, ingredient_inputs)

            if self.direction:
                for key in self.direction.directions:
                    sql = ''' UPDATE direction SET direction=? WHERE directionid=? AND step=?'''
                    direction_inputs = [self.direction.directions[key],
                                        db_id,
                                        key
                                        ]
                    cur = conn.cursor()
                    cur.execute(sql, direction_inputs)


            sql = ''' UPDATE dish SET name=?, dish_type=?,serves=?,prep=?,cook=?,rating=? WHERE id=?'''
            dish_inputs = [self.name,
                           self.dish_type,
                           self.serve,
                           self.prep,
                           self.cook,
                           self.rating,
                           db_id]
            cur = conn.cursor()
            cur.execute(sql, dish_inputs)
            conn.commit()
            conn.close()

class Nutrition:
    def __init__(self, calories=0, total_fat=0, carbs=0, protein=0, sat_fat=0, sodium=0, sugar=0, chol=0):
        self.calories = calories
        self.total_fat = total_fat
        self.carbs = carbs
        self.protein = protein
        self.sat_fat = sat_fat
        self.sodium = sodium
        self.sugar = sugar
        self.chol = chol

class Ingredient:
    def __init__(self):
        self.total_ingredients = 0
        self.ingredients = {}

    def add_ingredient(self, number, ingredient):
        self.total_ingredients += 1
        self.ingredients[number] = ingredient

class Direction:
    def __init__(self):
        self.total_directions = 0
        self.directions = {}

    def add_direction(self, number, direction):
        self.total_directions += 1
        self.directions[number] = direction
