/*
* Ninjax: an easy way to execute AJAX requests unobtrusively
*
* Usage:
*
*     Check out the default options for finding out the available features and
*     settings. Call the plugin as follows:
*
*    $('selector').ninjax();
*
*
* Set new defaults:
*
*    $.fn.ninjax.defaults =
*    {
* 	     ...
*    };
*
*
* Override defaults globally:
*
*    This will only override defaults that are explicitly set and these options
*    will be used for every instance.
*
*    $.fn.ninjax.set_defaults
*    (
* 	     event: 'click',
* 	     type : 'GET',
*    );
*
*
* Override defaults per instance:
*
*    This will only override defaults that are explicitly set and these options
*    will be used for only the current instance.
*
*    $('selector').ninjax({type: 'GET'});
*
*
* Override options per element using HTML 5 data attributes:
*
*    This will only override options that are explicitly set and these options
*    will be used for only the current element.
*
*    NOTE: this will override the options set when calling the plugin.
*          The order of overriding options is:
*          defaults < globally overridden defaults < defaults overridden per instance < options overridden per element
*
*    <div class="item" data-ninjax-options='{"event": "click", "type": "GET"}'></div>
*
*
* Author: creatoro
* License: http://creativecommons.org/licenses/by-sa/3.0/legalcode
*/

;(function($, window, document, undefined)
{
	// Ninjax: object instance
	$.ninjax = function(element, options)
	{
		// Set plugin
		var plugin = this;

		// Reference to the jQuery version of DOM element the plugin is attached to
		var $element = $(element);

		// Set metadata, which will allow to set options like this:
		// <div class="item" data-ninjax-options='{"event": "click", "type": "GET"}'></div>
		var metadata = $element.data('ninjax-options');

		// Plugin init
		plugin.init = function()
		{
			// Merge defaults, custom settings and metadata
			plugin.settings = $.extend({}, $.ninjax.defaults, options, metadata);

			// Run when the event is triggered
			$element.bind
			(
				plugin.settings.event,
				function(event)
				{
				    // Disable default event
					event.preventDefault();

					if ( ! plugin.settings.confirm_only && plugin.settings.data && ! $.isPlainObject(plugin.settings.data) && ! $.isArray(plugin.settings.data))
					{
						if ($(plugin.settings.data).length)
						{
							// Select and serialize data as selector given
							plugin.settings.data = $(plugin.settings.data).serialize();
						}
						else
						{
							// Data selector given, but data cannot be selected
							alert('Ninjax: data (' + plugin.settings.data + ') cannot be selected.');

							// Cannot continue
							return false;
						}
					}

					if (plugin.settings.url == '')
					{
						if ($element.attr('href'))
						{
							// Use the anchor's URL
							plugin.settings.url = $element.attr('href');
						}
						else if ($element.parents('form:first').attr('action'))
						{
							// Use the form's action
							plugin.settings.url = $element.parents('form:first').attr('action');
						}
						else
						{
							// URL cannot be found
							alert('Ninjax: no URL given.');

							// Cannot continue
							return false;
						}
					}

					if (plugin.settings.smart_confirm && $element.text())
					{
						// Use the text of the element for confirmation message
						plugin.settings.confirm_message = $element.text() + plugin.settings.smart_confirm_message;
					}

					if (plugin.settings.confirm_only)
					{
						// Force confirmation if confirmation only
						plugin.settings.confirm_needed = true;
					}

					if ( ! plugin.settings.confirm_needed || confirm(plugin.settings.confirm_message))
					{
						if (plugin.settings.confirm_only)
						{
							// No AJAX execution needed
							window.location.replace(plugin.settings.url);

							// Don't continue
							return;
						}

						// Execute request
						execute(event);
					}
				}
			);
		};

		// Execution of request
		var execute = function(event)
		{
			$.ajax
			({
				async     : (plugin.settings.success_action != 'proceed'),
				type      : plugin.settings.type,
				url       : plugin.settings.url,
				data      : plugin.settings.data,
				dataType  : 'json',
				beforeSend: function(jqXHR, settings)
				{
					// Call the before callback
					plugin.settings.before(plugin, event, jqXHR, settings);
				},
				success   : function(data, textStatus, jqXHR)
				{
					// Call the success callback
					plugin.settings.success(plugin, event, data, textStatus, jqXHR);
				},
				error     : function(jqXHR, textStatus, errorThrown)
				{
					// Call the error callback
					plugin.settings.error(plugin, event, jqXHR, textStatus, errorThrown);
				},
				complete  : function(jqXHR, textStatus)
				{
					// Call the after callback
					plugin.settings.after(plugin, event, jqXHR, textStatus);
				}
			});
		};

		// Init plugin
		plugin.init();
	};

	// Ninjax: default settings
	$.ninjax.defaults =
	{
		event                : 'click',           // String: the event that will trigger the execution
		url                  : '',                // String: target URL or empty for automatic selection of the element's 'href' attribute or form's action that wraps the element (if 'href' is unavailable)
		data                 : null,              // Mixed: data that should be sent to the URL or data selector that will select data to be serialized
		type                 : 'POST',            // String: request type, use 'POST' or 'GET'
		confirm_needed       : false,             // Boolean: should the action be confirmed?
		confirm_only         : false,             // Boolean: if this is set to true AJAX request will not be executed, only a confirmation will be displayed and the default event will be triggered, for example: loading a URL or posting a form
		confirm_message      : 'Are you sure?',   // String: message for confirmation
		smart_confirm        : true,              // Boolean: if true the plugin will try to use the element's text for confirmation
		smart_confirm_message: ': are you sure?', // String: this message will be used if smart confirm is enabled and the element's text can be found, for example if the anchor's text is 'Delete', then the full message will be: 'Delete: are you sure?'
		before_item          : '',                // Selector: the item that will be manipulated before executing the request
		before_html          : '',                // String: HTML that is used for DOM manipulation before executing the request
		before_action        : '',                // String: 'remove' to remove item, 'hide' to hide item, 'prepend' to prepend to item, 'append' to append to item, 'before' to add before item, 'after' to add after item, 'replace' to replace item, 'alert' to alert response, 'proceed' to proceed with default event
		success_item         : '',                // Selector: the item that will be manipulated on success
		success_action       : 'alert',           // String: 'remove' to remove item, 'hide' to hide item, 'prepend' to prepend to item, 'append' to append to item, 'before' to add before item, 'after' to add after item, 'replace' to replace item, 'alert' to alert response, 'proceed' to proceed with default event
		error_item           : '',                // Selector: the item that will be manipulated on error
		error_action         : 'alert',           // String: 'remove' to remove item, 'hide' to hide item, 'prepend' to prepend to item, 'append' to append to item, 'before' to add before item, 'after' to add after item, 'replace' to replace item, 'alert' to alert response, 'proceed' to proceed with default event
		after_item           : '',                // Selector: the item that will be manipulated after executing the request
		after_action         : '',                // String: 'remove' to remove item, 'hide' to hide item, 'prepend' to prepend to item, 'append' to append to item, 'before' to add before item, 'after' to add after item, 'replace' to replace item, 'alert' to alert response, 'proceed' to proceed with default event
		after_html           : '',                // String: HTML that is used for DOM manipulation after executing the request
		before               : function(ninjax, event, jqXHR, settings)
		{
			// Manipulate DOM before executing the request
			$.fn.ninjax.manipulate_dom(ninjax.settings.before_action, ninjax.settings.before_item, event, ninjax.settings.before_html);
		},
		success        : function(ninjax, event, data, textStatus, jqXHR)
		{
			// Manipulate DOM on successful request
			$.fn.ninjax.manipulate_dom(ninjax.settings.success_action, ninjax.settings.success_item, event, data);
		},
		error          : function(ninjax, event, jqXHR, textStatus, errorThrown)
		{
			// Manipulate DOM on error
			$.fn.ninjax.manipulate_dom(ninjax.settings.error_action, ninjax.settings.error_item, event, jqXHR.responseText);
		},
		after          : function(ninjax, event, jqXHR, textStatus)
		{
			// Manipulate DOM after executing the request
			$.fn.ninjax.manipulate_dom(ninjax.settings.after_action, ninjax.settings.after_item, event, ninjax.settings.after_html);
		}
	};

	// Ninjax: plugin function
	$.fn.ninjax = function(options)
	{
		// Iterate through the DOM elements we are attaching the plugin to
		return this.each
		(
			function()
			{
				// If plugin has not already been attached to the element
				if ($(this).data('ninjax') != true)
				{
					// Create a new instance of the plugin and pass the DOM element and the user-provided options as arguments
					var plugin = new $.ninjax($(this), options);

					// In the jQuery version of the element store a reference to the plugin object
					$(this).data('ninjax', plugin);
				}
			}
		);
	};

	// Ninjax: override defaults globally
	$.fn.ninjax.set_defaults = function(options)
	{
		// Set overridden defaults
		$.ninjax.defaults = $.extend({}, $.ninjax.defaults, options);
	};

	// Ninjax: manipulate DOM
	$.fn.ninjax.manipulate_dom = function(action, item, event, data)
	{
		// Don't proceed with default event by default
		var proceed = false;

		if (action == 'remove' || action == 'hide')
		{
			if ($(item).length)
			{
				if (action == 'remove')
				{
					// Remove item
					$(item).remove();
				}
				else if (action == 'hide')
				{
					// Hide item
					$(item).hide();
				}
			}
			else
			{
				// Can't find item
				alert('Ninjax: No such item (' + item + ') to ' + action + '.');
			}
		}
		else if (action == 'prepend' || action == 'append' || action == 'before' || action == 'after' || action == 'replace')
		{
			if ($(item).length)
			{
				if (action == 'prepend')
				{
					// Prepend response to item
					$(item).prepend(data);
				}
				else if (action == 'append')
				{
					// Append response to item
					$(item).append(data);
				}
				else if (action == 'before')
				{
					// Add response before item
					$(item).before(data);
				}
				else if (action == 'after')
				{
					// Add response after item
					$(item).after(data);
				}
				else if (action == 'replace')
				{
					// Replace item with response
					$(item).html(data);
				}

				$('html, body').animate
				(
					{
						// Scroll to item
						scrollTop: $(item).offset().top
					},
					'slow'
				);
			}
			else
			{
				if (item)
				{
					// Can't find item
					alert('Ninjax: No item (' + item + ') to add to using ' + action + '.');
				}
			}
		}
		else if (action == 'alert')
		{
			// Display response in alert
			alert(data);
		}
		else if (action == 'proceed')
		{
			// Default event should be called
			proceed = true;
		}

		if (proceed)
		{
			// Proceed with the default event
			event.trigger();
		}
	};

})(jQuery, window, document);