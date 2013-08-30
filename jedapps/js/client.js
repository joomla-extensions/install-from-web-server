Joomla.apps = {};
Joomla.apps.active = [];
Joomla.apps.view = "dashboard";
Joomla.apps.id = 0;
Joomla.apps.ordering = "";
Joomla.apps.fonturl = 'http://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic,700italic';
Joomla.apps.cssfiles = [
	'components/com_apps/views/dashboard/css/japps.css',
	'components/com_apps/views/dashboard/css/jquery.jscrollpane.css',
];
Joomla.apps.jsfiles = [
	'components/com_apps/views/dashboard/js/jquery.jscrollpane.min.js',
	'components/com_apps/views/dashboard/js/jquery.mousewheel.js',
	'components/com_apps/views/dashboard/js/jquery.japps.js'
];

Joomla.loadweb = function(url) {
	if ('' == url) { return false; }

	jQuery.ajax({
		url: url,
		dataType: 'jsonp',
		callbackParameter: "jsoncallback",
		timeout: 20000,
		success: function (response) {
			jQuery('#web-loader').hide();
			jQuery('#jed-container').html(response.data);
			jQuery('html, body').animate({ scrollTop: 0 }, 0);
		},
		fail: function() {
			jQuery('#web-loader').hide();
			jQuery('#web-loader-error').show();
		},
		complete: function() {
			if (Joomla.apps.ordering !== "") {
				jQuery('#com-apps-ordering').prop("selectedIndex", Joomla.apps.ordering);
			}
			Joomla.apps.slider();
			Joomla.apps.clicker();
			Joomla.apps.clickforlinks();
		},
		error: function(request, status, error) {
			if (request.responseText) {
				jQuery('#web-loader-error').html(request.responseText);
			}
			jQuery('#web-loader').hide();
			jQuery('#web-loader-error').show();
		}
	});
}

Joomla.webpaginate = function(url, target) {
	jQuery('#web-paginate-loader').show();
	
	jQuery.get(url, function(response) {
		jQuery('#web-paginate-loader').hide();
		jQuery('#'+target).html(response.data);
	}, 'jsonp').fail(function() { 
		jQuery('#web-paginate-loader').hide();
		//jQuery('#web-paginate-error').hide();
	});	
}

Joomla.installfromwebexternal = function(redirect_url) {
	var redirect_confirm = confirm('You will be redirected to the following link to complete the registration/purchase - \n'+redirect_url);
	if(true == redirect_confirm) {
		window.location.href=redirect_url+'&installat='+apps_installat_url;
	}
	
	return false;
}

Joomla.installfromweb = function(install_url, name) {
	if ('' == install_url) {
		alert("This extension cannot be installed via the web. Please visit the developer's website to purchase/download.");
		return false;
	}
	jQuery('#install_url').val(install_url);
	jQuery('#uploadform-web-url').text(install_url);
	if (name) {
		jQuery('#uploadform-web-name').text(name);
		jQuery('#uploadform-web-name-label').show();
	} else {
		jQuery('#uploadform-web-name-label').hide();
	}
	jQuery('#jed-container').slideUp(300);
	jQuery('#uploadform-web').show();
}

Joomla.installfromwebcancel = function() {
	jQuery('#uploadform-web').hide();
	jQuery('#jed-container').slideDown(300);
}

Joomla.installfromwebajaxsubmit = function() {
	if (Joomla.apps.view == 'extension') {
		Joomla.apps.view = 'category';
		Joomla.apps.id = jQuery('div.breadcrumbs a.transcode').slice(-1).attr('href').replace(/^.+[&\?]id=(\d+).*$/, '$1');
	}
	var tail = '&view='+Joomla.apps.view;
	if (Joomla.apps.id) {
		tail += '&id='+Joomla.apps.id;
	}
	
	if (jQuery('#com-apps-searchbox').val()) {
		var value = encodeURI(jQuery('#com-apps-searchbox').val().toLowerCase().replace(/ +/g,'_').replace(/[0-9]/g,'').replace(/[^a-z0-9-_]/g,'').trim());
		tail += '&filter_search='+value;
	}

	var ordering = Joomla.apps.ordering;
	if (ordering !== "" && jQuery('#com-apps-ordering').val()) {
		ordering = jQuery('#com-apps-ordering').val();
	}
	if (ordering) {
		tail += '&ordering='+ordering;alert(tail);
	}
	Joomla.loadweb(apps_base_url+'index.php?format=json&option=com_apps'+tail);
}

Joomla.apps.clickforlinks = function () {
	jQuery('a.transcode').live('click', function(event){
		ajax_url = jQuery(this).attr('href');
		Joomla.apps.view = ajax_url.replace(/^.+[&\?]view=(\w+).*$/, '$1');
		if (Joomla.apps.view == 'dashboard') {
			Joomla.apps.id = 0;
		}
		else {
			Joomla.apps.id = ajax_url.replace(/^.+[&\?]id=(\d+).*$/, '$1');
		}
		event.preventDefault();
		Joomla.loadweb(apps_base_url + ajax_url);
	});
}

jQuery(document).ready(function() {
	var link = jQuery('#myTabTabs a[href="#web"]').get(0);
	jQuery(link).closest('li').click(function (event){
		Joomla.apps.initialize();
	});
});

Joomla.apps.initialize = function() {
	Joomla.loadweb(apps_base_url+'index.php?format=json&option=com_apps&view=dashboard');
	
	Joomla.apps.clickforlinks();
	
	jQuery('#com-apps-searchbox').live('keypress', function(event){
		if(event.which == 13) {
			Joomla.installfromwebajaxsubmit();
		}
	});

	jQuery('#com-apps-ordering').live('change', function(event){
		Joomla.apps.ordering = jQuery(this).prop("selectedIndex");
		Joomla.installfromwebajaxsubmit();
	});
	
	if (apps_installfrom_url != '') {
		Joomla.installfromweb(apps_installfrom_url);
	}

}
