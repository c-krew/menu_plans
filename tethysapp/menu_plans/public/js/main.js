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

function input_six_sisters () {
    var info = $("#ss-paste").val().split("\n")
    $('#six-sister-modal').modal('hide');
    $('#save-dish-modal').modal('show');
    $("#dishtable").find("tbody>tr").find("td:eq(0) input[type='text']").val(info[0].slice(30));
    $("#dishtable").find("tbody>tr").find("td:eq(2) input[type='text']").val(info[3].slice(8))
    $("#dishtable").find("tbody>tr").find("td:eq(3) input[type='text']").val(info[4].slice(11,13))
    $("#dishtable").find("tbody>tr").find("td:eq(4) input[type='text']").val(info[5].slice(11,13))

    var i;
    for (i = 7; i < 16; i++) {
        data = info[i].split(":")
        nutrition = data[0].replace(" ", "").toLowerCase()
        number = data[1].split(/([0-9]+)/)
        value = ''
        var x;
        for (x = 1; x < number.length - 1; x++) {
            value += number[x]
        }
        $("#" + nutrition + "input").val(value)
    }

    tabletype = 'ingredient'
    row = 0
    var y;
    for (y=17; y < info.length; y++) {
        if (info[y].slice(0,-1).toLowerCase() == 'directions') {
            tabletype = 'direction';
            row = 0;
            continue;
        }
        if (row > 0) {
            if (tabletype == 'ingredient') {
                add_ingredient()
            } else {
                add_direction()
            }
        }
        $('#' + tabletype + 'table').find("tr:eq(" + (row + 1) + ")").find("td:eq(1)  input[type='text']").val(info[y]);
        row++
    }
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
            $("#nutritiontable").find("tbody>tr").find("td:eq(8) input[type='text']").val(response['nutrition'][9])
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
    var cal = $("#caloriesinput").val()
    var carb = $("#carbohydratesinput").val()
    var satfat = $("#saturatedfatinput").val()
    var totfat = $("#totalfatinput").val()
    var sugar = $("#sugarinput").val()
    var protein = $("#proteininput").val()
    var chol = $("#cholesterolinput").val()
    var sodium = $("#sodiuminput").val()
    var fiber= $("#fiberinput").val()

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
               'fiber':fiber,
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