from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from tethys_sdk.gizmos import Button, SelectInput

@login_required()
def home(request):
    """
    Controller for the app home page.
    """

    dish_type = SelectInput(display_text='',
                                name='dish-type',
                                multiple=False,
                                options=[('Main', 'Main'), ('Side', 'Side'), ('Dessert', 'Dessert')],
                                initial=['Main'],
                            )

    add_button = Button(
        display_text='Add',
        name='add-meal',
        icon='glyphicon glyphicon-plus',
        style='success',
        attributes={'form': 'add-meal-form'},
        submit=True
    )

    edit_button = Button(
        display_text='',
        name='edit-button',
        icon='glyphicon glyphicon-edit',
        style='warning',
        attributes={
            'data-toggle':'tooltip',
            'data-placement':'top',
            'title':'Edit'
        }
    )

    remove_button = Button(
        display_text='',
        name='remove-button',
        icon='glyphicon glyphicon-remove',
        style='danger',
        attributes={
            'data-toggle':'tooltip',
            'data-placement':'top',
            'title':'Remove'
        }
    )

    previous_button = Button(
        display_text='Previous',
        name='previous-button',
        attributes={
            'data-toggle':'tooltip',
            'data-placement':'top',
            'title':'Previous'
        }
    )

    next_button = Button(
        display_text='Next',
        name='next-button',
        attributes={
            'data-toggle':'tooltip',
            'data-placement':'top',
            'title':'Next'
        }
    )

    context = {
        'add_button': add_button,
        'dish_type': dish_type,
        'edit_button': edit_button,
        'remove_button': remove_button,
        'previous_button': previous_button,
        'next_button': next_button,
    }

    return render(request, 'menu_plans/home.html', context)