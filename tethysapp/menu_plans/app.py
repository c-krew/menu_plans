from tethys_sdk.base import TethysAppBase, url_map_maker


class MenuPlans(TethysAppBase):
    """
    Tethys app class for Menu Plans.
    """

    name = 'Menu Plans'
    index = 'menu_plans:home'
    icon = 'menu_plans/images/icon.gif'
    package = 'menu_plans'
    root_url = 'menu-plans'
    color = '#187ce0'
    description = 'Place a brief description of your app here.'
    tags = ''
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='home',
                url='menu-plans',
                controller='menu_plans.controllers.home'
            ),
        )

        return url_maps
