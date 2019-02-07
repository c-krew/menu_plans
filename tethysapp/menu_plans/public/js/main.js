function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

function add_ingredient () {
    var thizz = document.getElementById('ingredienttable');
    var step = $(thizz).closest('table').find('tr:last td:first').text();

    var new_step = parseInt(step) + 1;
    var row = '<td>' + new_step + '</td><td><input type="text" style="width:100%" form="add-meal-form"></td>'
    $('#ingredienttable > tbody:last-child').append('<tr>' + row + '</tr>');
}

function add_direction () {
    var thizz = document.getElementById('directiontable');
    var step = $(thizz).closest('table').find('tr:last td:first').text();

    var new_step = parseInt(step) + 1;
    var row = '<td>' + new_step + '</td><td><input type="text" style="width:100%" form="add-meal-form"></td>'
    $('#directiontable > tbody:last-child').append('<tr>' + row + '</tr>');
}

function upload_six_sisters () {
    $('#six-sister-modal').modal('show');
}
(36) ["SMALLER FAMILY HEALTHY – GROUND TURKEY SAUSAGE LASAGNA SOUP",
"Remove Recipe", "MAIN DISH", "Serves: 4", "Prep Time: 20 Minutes", "Cook Time: 20 Minutes",
"NUTRITION PER SERVING:", "Calories: 357", "Total Fat: 13.4g", "Carbohydrates: 28.1g", "Protein: 32.4g",
"Fiber: 5.5g", "Saturated Fat: 4.1g", "Sodium: 990mg", "Sugar: 11g", "Cholesterol: 95mg", "INGREDIENTS:",
"3/4 onion (diced)", "1 1/2 teaspoons minced garlic", "1 pound ground turkey", "4 cups chicken broth",
"1 (15 ounce) cans petite diced tomatoes (do not drain)", "1 (6 ounce) can tomato paste", "1 teaspoon oregano",
"1/2 teaspoon Italian seasoning", "2 Tablespoons fresh basil (chopped)",
"6 whole wheat lasagna noodles (uncooked and broken into bite-sized pieces)", "1 zucchini (diced)",
"1/3 cup shredded Parmesan cheese", "Salt and pepper, to taste", "DIRECTIONS:",
"In a large stock pot, add onion, garlic and turkey; cook until turkey is browned. Drain grease.",
"Add in chicken broth, tomatoes, tomato paste, oregano, Italian seasoning, and basil.",
"Mix well and bring to a boil.",
 "Add in broken noodles and zucchini and cook for 8-10 minutes or until noodles are tender.",
 "Stir in Parmesan cheese and add salt and pepper to taste."]

function input_six_sisters () {
    var info = $("#ss-paste")
    console.log(info)
    console.log(info.val().split("\n"));
}

function get_all_dishes () {
    $.ajax({
        url: '/apps/menu-plans/get-all-dishes/',
        type: 'POST',
        data: {},
        success: function (response) {
            $("#dish-table tbody").empty()
            var i;
            for (i = 0; i < response['data'].length; i++) {
              var newRowContent = "<tr><td>" + response['data'][i][1] + "</td><td>" + response['data'][i][2] + "</td>";
              newRowContent += "<td width=10%><input type='button' data-id=" + response['data'][i][0] + " class='btn btn-warning' onclick='get_dish (this)' value='Edit'></td>"
              newRowContent += "<td width=10%><input type='button' data-id=" + response['data'][i][0] + " class='btn btn-danger' onclick='delete_dish (this)' value='Delete'></td></tr>"
              $("#dish-table tbody").append(newRowContent);
            }
        }
    })
}

function delete_dish (d) {
    var id = d.getAttribute("data-id")
    $.ajax({
        url: '/apps/menu-plans/delete-dish/',
        type: 'POST',
        data: {'id': id},
        success: function (response) {
            $("#dish-table tbody").empty()
            var i;
            for (i = 0; i < response['data'].length; i++) {
              var newRowContent = "<tr><td>" + response['data'][i][1] + "</td><td>" + response['data'][i][2] + "</td>";
              newRowContent += "<td width=10%><input type='button' data-id=" + response['data'][i][0] + " class='btn btn-warning' onclick='get_dish (this)' value='Edit'></td>"
              newRowContent += "<td width=10%><input type='button' data-id=" + response['data'][i][0] + " class='btn btn-danger' onclick='delete_dish (this)' value='Delete'></td></tr>"
              $("#dish-table tbody").append(newRowContent);
            }
        }
    })
}

function get_dish (d) {
    var id = d.getAttribute("data-id")
    $.ajax({
        url: '/apps/menu-plans/get-dish/',
        type: 'POST',
        data: {'id': id},
        success: function (response) {
            $('#edit-dish-modal').modal('hide');
            $('#save-dish-modal').modal('show');
            $("#dishtable").find("tbody>tr").find("td:eq(0) input[type='text']").val(response['dish'][1])
            $("#dish-type").val(response['dish'][2]).change()
            $("#dishtable").find("tbody>tr").find("td:eq(2) input[type='text']").val(response['dish'][3])
            $("#dishtable").find("tbody>tr").find("td:eq(3) input[type='text']").val(response['dish'][4])
            $("#dishtable").find("tbody>tr").find("td:eq(4) input[type='text']").val(response['dish'][5])
            $("#dishtable").find("tbody>tr").find("td:eq(5) input[type='text']").val(response['dish'][6])
            $("#nutritiontable").find("tbody>tr").find("td:eq(0) input[type='text']").val(response['nutrition'][1])
            $("#nutritiontable").find("tbody>tr").find("td:eq(1) input[type='text']").val(response['nutrition'][2])
            $("#nutritiontable").find("tbody>tr").find("td:eq(2) input[type='text']").val(response['nutrition'][3])
            $("#nutritiontable").find("tbody>tr").find("td:eq(3) input[type='text']").val(response['nutrition'][4])
            $("#nutritiontable").find("tbody>tr").find("td:eq(4) input[type='text']").val(response['nutrition'][5])
            $("#nutritiontable").find("tbody>tr").find("td:eq(5) input[type='text']").val(response['nutrition'][6])
            $("#nutritiontable").find("tbody>tr").find("td:eq(6) input[type='text']").val(response['nutrition'][7])
            $("#nutritiontable").find("tbody>tr").find("td:eq(7) input[type='text']").val(response['nutrition'][8])
            var i;
            for (i = 0; i < response['ingredient'].length; i++) {
              var rowCount = $('#ingredienttable tbody tr').length;
              if (rowCount < response['ingredient'].length) {
                add_ingredient()
              }
              $("#ingredienttable").find("tbody").find("tr:eq(" + i + ")").find("td:eq(0) input[type='text']").val(response['ingredient'][i][2])
              $("#ingredienttable").find("tbody").find("tr:eq(" + i + ")").find("td:eq(1) input[type='text']").val(response['ingredient'][i][3])
            }
            var i;
            for (i = 0; i < response['direction'].length; i++) {
              var rowCount = $('#directiontable tbody tr').length;
              if (rowCount < response['direction'].length) {
                add_direction()
              }
              $("#directiontable").find("tbody").find("tr:eq(" + i + ")").find("td:eq(0) input[type='text']").val(response['direction'][i][2])
              $("#directiontable").find("tbody").find("tr:eq(" + i + ")").find("td:eq(1) input[type='text']").val(response['direction'][i][3])
            }
            $("#save-id").attr("data-id",response['dish'][0]);
            $("#save-id").removeClass("hidden");
        }
    })
}

function add_new_meal (create_type) {
    if (create_type == 'update') {
        var db_id = $('#save-id').data('id')
    } else {
        var db_id = "none"
    }
    var dish_name = $("#dishnameinput").val()
    var dish_type = $("#dish-type").val()
    var serves = $("#servesinput").val()
    var prep = $("#prepinput").val()
    var cook = $("#cookinput").val()
    var rating = $("#rating").val()
    var cal = $("#calinput").val()
    var carb = $("#carbinput").val()
    var satfat = $("#satfatinput").val()
    var totfat = $("#totfatinput").val()
    var sugar = $("#sugarinput").val()
    var protein = $("#proteininput").val()
    var chol = $("#cholinput").val()
    var sodium = $("#sodiuminput").val()

    var ingredients = {};
    $("#ingredienttable").find("tbody>tr").each(function (i, el) {
        var step = $(this).find("td:eq(0)").text()
        var ingredient = $(this).find("td:eq(1) input[type='text']").val()
        ingredients[step] = ingredient
    });

    var directions = {};
    $("#directiontable").find("tbody>tr").each(function (i, el) {
        var step = $(this).find("td:eq(0)").text()
        var direction = $(this).find("td:eq(1) input[type='text']").val()
        directions[step] = direction
    });

    var formData = new FormData();
    formData.append('file', $('#dish-picture')[0].files[0]);

    $.ajax({
        url: '/apps/menu-plans/create-meal/',
        type: 'POST',
        data: {'db_id': db_id,
               'dish_name':dish_name,
               'dish_type': dish_type,
               'serves':serves,
               'prep':prep,
               'cook':cook,
               'rating':rating,
               'cal':cal,
               'carb':carb,
               'satfat':satfat,
               'totfat':totfat,
               'sugar':sugar,
               'protein':protein,
               'chol':chol,
               'sodium':sodium,
               'ingredients':JSON.stringify(ingredients),
               'directions':JSON.stringify(directions)
               },
        success: function (response) {
            $('#save-dish-modal').modal('hide');
        }
    })
}

$('#edit-dish-modal').on('shown.bs.modal', function (e) {
  get_all_dishes ()
})

$(function(){
  $("#myTab a:first").tab('show');
});