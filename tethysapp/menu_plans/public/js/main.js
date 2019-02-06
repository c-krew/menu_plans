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
    var row = '<td><input class="fullinput" type="text" form="add-meal-form"></td><td><input type="text" style="width:100%" form="add-meal-form"></td><td><input type="text" style="width:120%" form="add-meal-form"></td><td><input type="text" form="add-meal-form"></td>'
    $('#ingredienttable > tbody:last-child').append('<tr>' + row + '</tr>');
}

function add_direction () {
    var thizz = document.getElementById('directiontable');
    var step = $(thizz).closest('table').find('tr:last td:first').text();

    var new_step = parseInt(step) + 1;
    var row = '<td>' + new_step + '</td><td><input type="text" style="width:100%" form="add-meal-form"></td>'
    $('#directiontable > tbody:last-child').append('<tr>' + row + '</tr>');
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
            $("#dishtable").find("tbody>tr").find("td:eq(1) input[type='text']").val(response['dish'][2])
            $("#dishtable").find("tbody>tr").find("td:eq(2) input[type='text']").val(response['dish'][3])
            $("#dishtable").find("tbody>tr").find("td:eq(3) input[type='text']").val(response['dish'][4])
            $("#dishtable").find("tbody>tr").find("td:eq(4) input[type='text']").val(response['dish'][5])
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
              $("#ingredienttable").find("tbody").find("tr:eq(" + i + ")").find("td:eq(0) input[type='text']").val(response['ingredient'][i][3])
              $("#ingredienttable").find("tbody").find("tr:eq(" + i + ")").find("td:eq(1) input[type='text']").val(response['ingredient'][i][4])
              $("#ingredienttable").find("tbody").find("tr:eq(" + i + ")").find("td:eq(2) input[type='text']").val(response['ingredient'][i][5])
              $("#ingredienttable").find("tbody").find("tr:eq(" + i + ")").find("td:eq(3) input[type='text']").val(response['ingredient'][i][6])
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
        var ingredient = $(this).find("td:eq(0) input[type='text']").val()
        var quantity = $(this).find("td:eq(1) input[type='text']").val()
        var measure = $(this).find("td:eq(2) input[type='text']").val()
        var method = $(this).find("td:eq(3) input[type='text']").val()
        ingredients[ingredient] = {}
        ingredients[ingredient]['quantity'] = quantity
        ingredients[ingredient]['measure'] = measure
        ingredients[ingredient]['method'] = method
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