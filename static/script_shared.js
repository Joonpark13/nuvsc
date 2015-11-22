function parseTextList(li){
    if (li[0] == '[' && li[li.length - 1] == ']'){
        var str_li = li.substring(1, li.length - 1).split('{').slice(1);
    } else{
        var str_li = li.split('{').slice(1);
    }
    var json_li = [];
    for (var i = 0; i < str_li.length; i++){
        if (i == str_li.length - 1){
            json_li.push(JSON.parse('{' + str_li[i]));
        }
        else {
            var str_trimmed = '{' + str_li[i].trim();
            json_li.push(JSON.parse(str_trimmed.substring(0, str_trimmed.length - 1)));
        }
    }
    return json_li;
}

function checkListedCourses(input){
    for (var i = 0; i < current_subject.length; i++){
        // If it's already open, remove the courses
        if (current_subject[i] == input.parentElement.getAttribute('id')){
            var courses_num = input.parentElement.children.length;
            for (var j = 0; j < courses_num; j++){
                if (j != 0){
                    input.parentElement.removeChild(input.parentElement.lastChild);
                }
            }
            current_subject.splice(i, 1);
            return true;
        }
    }
    return false;
}

// Add component
$(document).on('click', '.component_link', function(){
    var symbol = this.id;
    // Extract id from component symbol
    var id = symbol.split("_")[0];
    comp_selected = true;
    var comp_link = document.getElementById(symbol);

    if (comp_link.style.color == 'red'){
            window.alert("This course is already in your cart.");
            return;
    }
    comp_link.style.color = 'red';

    if (idbSupported){
        var transaction = db.transaction(['component'], 'readonly');
        var store = transaction.objectStore('component');
        var getComp = store.get(symbol);
        getComp.onsuccess = function(e){
            var comp = e.target.result;

            // Store to local storage
            if (typeof(Storage) !== "undefined"){
                localStorage.setItem("component_" + id.toString(), JSON.stringify({'symbol':symbol, 'id':id, 'data':comp}));
            }

            var start_formatted = "2015-10-09" + 'T' + comp['start_time'] + ':00';
            var end_formatted = "2015-10-09" + 'T' + comp['end_time'] + ':00';

            // Adding course to calendar
            if (comp['dow'] != '[]'){
                var comp_event = {
                    title: comp['course'],
                    id: id + "_comp",
                    //TODO add start and end date functionality
                    start: start_formatted,
                    end: end_formatted,
                    component: comp['component'],
                    dow: comp['dow'],
                    section: comp['section'],
                    room: comp['room']
                }
                $('#calendar').fullCalendar('renderEvent', comp_event, 'stick');
            }
            $('#sections_modal').modal('hide')
        }
        transaction.oncomplete = function(){
            // Increment hours per week
            var total_hrs = 0;
            var cal_events = $('#calendar').fullCalendar('clientEvents', idOrFilter = id + "_comp");
            for (var j = 0; j < cal_events.length; j++){
                var start = cal_events[j]['start'].toDate();
                var end = cal_events[j]['end'].toDate();
                var min = (end - start) / 60000;
                // in case of unscheduled courses
                if (isNaN(min)){
                    min = 0;
                }
                if (min % 30 == 20){
                    min += 10;
                }
                total_hrs += parseFloat(min) / 60;
            }
            var old_hr = parseFloat(document.getElementById("course_hours").innerHTML);
            document.getElementById("course_hours").innerHTML = old_hr + total_hrs;
        }
    } else{
        $.get("/component/" + symbol, function(comp_data){
            var comp = parseTextList(comp_data)[0];

            // Store to local storage
            if (typeof(Storage) !== "undefined"){
                localStorage.setItem("component_" + id.toString(), JSON.stringify({'symbol':symbol, 'id':id, 'data':comp}));
            }

            var start_formatted = "2015-10-09" + 'T' + comp['start_time'] + ':00';
            var end_formatted = "2015-10-09" + 'T' + comp['end_time'] + ':00';

            // Adding course to calendar
            if (comp['dow'] != '[]'){
                var comp_event = {
                    title: comp['course'],
                    id: id + "_comp",
                    //TODO add start and end date functionality
                    start: start_formatted,
                    end: end_formatted,
                    component: comp['component'],
                    dow: comp['dow'],
                    section: comp['section'],
                    room: comp['room']
                }
                $('#calendar').fullCalendar('renderEvent', comp_event, 'stick');
            }
            $('#sections_modal').modal('hide')
            var total_hrs = 0;
            var cal_events = $('#calendar').fullCalendar('clientEvents', idOrFilter = id + "_comp");
            for (var j = 0; j < cal_events.length; j++){
                var start = cal_events[j]['start'].toDate();
                var end = cal_events[j]['end'].toDate();
                var min = (end - start) / 60000;
                // in case of unscheduled courses
                if (isNaN(min)){
                    min = 0;
                }
                if (min % 30 == 20){
                    min += 10;
                }
                total_hrs += parseFloat(min) / 60;
            }
            var old_hr = parseFloat(document.getElementById("course_hours").innerHTML);
            document.getElementById("course_hours").innerHTML = old_hr + total_hrs;
        });        
    }
});

function re_add_component(symbol, id, data){
    var comp = data;
    
    var start_formatted = "2015-10-09" + 'T' + comp['start_time'] + ':00';
    var end_formatted = "2015-10-09" + 'T' + comp['end_time'] + ':00';

    // Adding course to calendar
    if (comp['dow'] != '[]'){
        var comp_event = {
            title: comp['course'],
            id: id + "_comp",
            //TODO add start and end date functionality
            start: start_formatted,
            end: end_formatted,
            component: comp['component'],
            dow: comp['dow'],
            section: comp['section'],
            room: comp['room']
        }
        $('#calendar').fullCalendar('renderEvent', comp_event, 'stick');
    }
}

function add_section_supported(id){
    // Check if course is aleady in cart
    var sections_in_cart = document.getElementById("cart").children;
    for (var i = 0; i < sections_in_cart.length; i++){
        if (sections_in_cart[i].id == id){
            window.alert("This course is already in your cart.");
            return;
        }
    }

    var section = {};
    var descriptions = [];

    var transaction = db.transaction(['section'], 'readonly');
    var store = transaction.objectStore('section');
    var index = store.index("section_id");
    var getSection = store.get(Number(id));
    getSection.onsuccess = function(e){
        section = e.target.result;
    }
    transaction.oncomplete = function(){
        var transactionD = db.transaction(['description'], 'readonly');
        var storeD = transactionD.objectStore('description');
        var indexD = storeD.index('section_id');
        var keyRangeD = IDBKeyRange.only(id);
        indexD.openCursor(keyRangeD).onsuccess = function(eD){
            var cursor = eD.target.result;
            if (cursor){
                //if (cursor.value['section_id'] == id){
                    descriptions.push(cursor.value);
                //}
                cursor.continue();
            }
        }
        transactionD.oncomplete = function(){
            // Adding info to cart
            // Create containing div
            var section_data = document.createElement('div');
            section_data.setAttribute('class', 'section_cart panel panel-default');
            section_data.setAttribute('id', id);

            // Populate div with content

            // Store to local storage
            if(typeof(Storage) !== "undefined"){
                localStorage.setItem("section_" + id.toString(), JSON.stringify({'id':id, 'data':section, 'desc':descriptions}));
            }

            // Add to CAESAR Panel
            var CAESAR_div = document.createElement('div');
            CAESAR_div.setAttribute('id', 'CAESAR' + id);
            CAESAR_div.innerHTML = section['course'] + "<ul><li>" + section['univ_num'] + "</li></ul>";
            document.getElementById("CAESAR").appendChild(CAESAR_div);

            // Create panel heading and panel
            var panel_head = document.createElement('div');
            panel_head.setAttribute('class', 'panel-heading');

            var panel_row = document.createElement('div');
            panel_row.setAttribute('class', 'row');

            panel_head.appendChild(panel_row);

                var panel_title = document.createElement('h4');
                panel_title.setAttribute('class', 'panel-title col-md-11');
                panel_title.innerHTML = "<a data-toggle='collapse' href='#" + id + "_collapse'>" + section['course'] + "</a>";

                panel_row.appendChild(panel_title);

                var panel_remove = document.createElement('a');
                panel_remove.setAttribute('class', 'col-md-1');
                panel_remove.setAttribute('role', 'button');
                panel_remove.setAttribute('onclick', 'remove_course(this.parentElement.parentElement.parentElement.id)');

                var panel_remove_button = document.createElement('span');
                panel_remove_button.setAttribute('class', 'glyphicon glyphicon-remove');
                panel_remove.appendChild(panel_remove_button);

                panel_row.appendChild(panel_remove);

            var panel = document.createElement('div');
            panel.setAttribute('class', 'panel-collapse collapse');
            panel.setAttribute('id', id + '_collapse');

                var panel_body = document.createElement('div');
                panel_body.setAttribute('class', 'panel-body');
                panel.appendChild(panel_body);
                
                    var course_p = document.createElement('p');
                    course_p.innerHTML = "<h4><b>" + section['course'] + "</b></h4>";

                    var section_p = document.createElement('p');
                    section_p.innerHTML = "Section " + section['section'];
                    
                    var instructor_p = document.createElement('p');
                    instructor_p.innerHTML = section['instructor'];

                    var room_p = document.createElement('p');
                    room_p.innerHTML = section['room'];

                    var overview_p = document.createElement('p');
                    overview_p.innerHTML = "<b>Overview:</b> " + section['overview'];

                    var requirements_p = document.createElement('p');
                    requirements_p.innerHTML = "<b>Requirements:</b> " + section['requirements'];

                                        var univ_num_p = document.createElement('p');
                                        univ_num_p.innerHTML = "<b>CAESAR Class Nbr</b> " + section['univ_num'];

                    var remove_a = document.createElement('a');
                    remove_a.setAttribute('onclick', 'remove_course(this.parentElement.parentElement.parentElement.id)');
                    remove_a.setAttribute('href', 'javascript:;');
                    remove_a.innerHTML = "Remove";

                panel_body.appendChild(course_p);
                panel_body.appendChild(instructor_p);
                panel_body.appendChild(section_p);
                panel_body.appendChild(room_p);
                panel_body.appendChild(overview_p);
                panel_body.appendChild(requirements_p);
                panel_body.appendChild(univ_num_p);

            if (descriptions != "") {
                var descriptions_link = document.createElement('a');
                descriptions_link.setAttribute('role', 'button');
                descriptions_link.setAttribute('data-toggle', 'collapse');
                descriptions_link.setAttribute('data-target', '#' + id + '_descriptions');
                descriptions_link.innerHTML = "Toggle More Descriptions";
                var descriptions_div = document.createElement('div');
                descriptions_div.setAttribute('class', 'collapse');
                descriptions_div.setAttribute('id', id + '_descriptions');
                for (var key in descriptions){
                    var desc_name = document.createElement('b');
                    desc_name.innerHTML = key;
                    descriptions_div.appendChild(desc_name);
                    var desc_desc = document.createElement('p');
                    desc_desc.innerHTML = descriptions[key];
                    descriptions_div.appendChild(desc_desc);
                }
                panel_body.appendChild(descriptions_link);
                panel_body.appendChild(descriptions_div);
            }

            panel_body.appendChild(document.createElement('br'));
            panel_body.appendChild(remove_a);

            section_data.appendChild(panel_head);
            section_data.appendChild(panel);

            // Put the course in the cart
            document.getElementById("cart").appendChild(section_data);

            var start_formatted = "2015-10-09" + 'T' + section['start_time'] + ':00';
            var end_formatted = "2015-10-09" + 'T' + section['end_time'] + ':00';

            // Adding course to calendar
            if (section['dow'] == '[]'){
                var unscheduled_section = document.createElement('div');
                unscheduled_section.setAttribute('id', id);
                unscheduled_section.innerHTML = "<p>" + section['course'] + "</p>";
                document.getElementById("unscheduled").appendChild(unscheduled_section);
            }
            else {
                var section_event = {
                    title: section['course'],
                    id: id,
                    //TODO add start and end date functionality
                    start: start_formatted,
                    end: end_formatted,
                    dow: section['dow'],
                    section: section['section'],
                    instructor: section['instructor'],
                    room: section['room'],
                    overview: section['overview'],
                    requirements: section['requirements']
                }
                $('#calendar').fullCalendar('renderEvent', section_event, 'stick');
            }

            // Increment number of courses
            var num = parseInt(document.getElementById("number_of_courses").innerHTML) + 1;
            document.getElementById("number_of_courses").innerHTML = num;

            // Increment hours per week
            var total_hrs = 0;
            var cal_events = $('#calendar').fullCalendar('clientEvents', idOrFilter = id);
            for (var j = 0; j < cal_events.length; j++){
                var start = cal_events[j]['start'].toDate();
                var end = cal_events[j]['end'].toDate();
                var min = (end - start) / 60000;
                // in case of unscheduled courses
                if (isNaN(min)){
                    min = 0;
                }
                if (min % 30 == 20){
                    min += 10;
                }
                total_hrs += parseFloat(min) / 60;
            }
            var old_hr = parseFloat(document.getElementById("course_hours").innerHTML);
            document.getElementById("course_hours").innerHTML = old_hr + total_hrs;
        }
    }
}

function add_section_not_supported(id){
    // Check if course is aleady in cart
    var sections_in_cart = document.getElementById("cart").children;
    for (var i = 0; i < sections_in_cart.length; i++){
        if (sections_in_cart[i].id == id){
            window.alert("This course is already in your cart.");
            return;
        }
    }

    $.get("/section/" + id, function(section_request_data){
        $.get("/descriptions/" + id, function(descriptions_data){
            // Adding info to cart
            // Create containing div
            var section_data = document.createElement('div');
            section_data.setAttribute('class', 'section_cart panel panel-default');
            section_data.setAttribute('id', id);

            // Populate div with content
            var section = parseTextList(section_request_data)[0];
            var descriptions = parseTextList(descriptions_data)[0];

            // Store to local storage
            if(typeof(Storage) !== "undefined"){
                localStorage.setItem("section_" + id.toString(), JSON.stringify({'id':id, 'data':section, 'desc':descriptions}));
            }
            
            // Create panel heading and panel
            var panel_head = document.createElement('div');
            panel_head.setAttribute('class', 'panel-heading');

            var panel_row = document.createElement('div');
            panel_row.setAttribute('class', 'row');

            panel_head.appendChild(panel_row);

                var panel_title = document.createElement('h4');
                panel_title.setAttribute('class', 'panel-title col-md-11');
                panel_title.innerHTML = "<a data-toggle='collapse' href='#" + id + "_collapse'>" + section['course'] + "</a>";

                panel_row.appendChild(panel_title);

                var panel_remove = document.createElement('a');
                panel_remove.setAttribute('class', 'col-md-1');
                panel_remove.setAttribute('role', 'button');
                panel_remove.setAttribute('onclick', 'remove_course(this.parentElement.parentElement.parentElement.id)');

                var panel_remove_button = document.createElement('span');
                panel_remove_button.setAttribute('class', 'glyphicon glyphicon-remove');
                panel_remove.appendChild(panel_remove_button);

                panel_row.appendChild(panel_remove);

            var panel = document.createElement('div');
            panel.setAttribute('class', 'panel-collapse collapse');
            panel.setAttribute('id', id + '_collapse');

                var panel_body = document.createElement('div');
                panel_body.setAttribute('class', 'panel-body');
                panel.appendChild(panel_body);
                
                    var course_p = document.createElement('p');
                    course_p.innerHTML = "<h4><b>" + section['course'] + "</b></h4>";

                    var section_p = document.createElement('p');
                    section_p.innerHTML = "Section " + section['section'];
                    
                    var instructor_p = document.createElement('p');
                    instructor_p.innerHTML = section['instructor'];

                    var room_p = document.createElement('p');
                    room_p.innerHTML = section['room'];

                    var overview_p = document.createElement('p');
                    overview_p.innerHTML = "<b>Overview:</b> " + section['overview'];

                    var requirements_p = document.createElement('p');
                    requirements_p.innerHTML = "<b>Requirements:</b> " + section['requirements'];

                    var remove_a = document.createElement('a');
                    remove_a.setAttribute('onclick', 'remove_course(this.parentElement.parentElement.parentElement.id)');
                    remove_a.setAttribute('href', 'javascript:;');
                    remove_a.innerHTML = "Remove";

                panel_body.appendChild(course_p);
                panel_body.appendChild(instructor_p);
                panel_body.appendChild(section_p);
                panel_body.appendChild(room_p);
                panel_body.appendChild(overview_p);
                panel_body.appendChild(requirements_p);

            descriptions = parseTextList(descriptions_data)[0];

            if (descriptions != "") {
                var descriptions_link = document.createElement('a');
                descriptions_link.setAttribute('role', 'button');
                descriptions_link.setAttribute('data-toggle', 'collapse');
                descriptions_link.setAttribute('data-target', '#' + id + '_descriptions');
                descriptions_link.innerHTML = "Toggle More Descriptions";
                var descriptions_div = document.createElement('div');
                descriptions_div.setAttribute('class', 'collapse');
                descriptions_div.setAttribute('id', id + '_descriptions');
                for (var key in descriptions){
                    var desc_name = document.createElement('b');
                    desc_name.innerHTML = key;
                    descriptions_div.appendChild(desc_name);
                    var desc_desc = document.createElement('p');
                    desc_desc.innerHTML = descriptions[key];
                    descriptions_div.appendChild(desc_desc);
                }
                panel_body.appendChild(descriptions_link);
                panel_body.appendChild(descriptions_div);
            }

            panel_body.appendChild(document.createElement('br'));
            panel_body.appendChild(remove_a);

            section_data.appendChild(panel_head);
            section_data.appendChild(panel);

            // Put the course in the cart
            document.getElementById("cart").appendChild(section_data);

            var start_formatted = "2015-10-09" + 'T' + section['start_time'] + ':00';
            var end_formatted = "2015-10-09" + 'T' + section['end_time'] + ':00';

            // Adding course to calendar
            if (section['dow'] == '[]'){
                var unscheduled_section = document.createElement('div');
                unscheduled_section.setAttribute('id', id);
                unscheduled_section.innerHTML = "<p>" + section['course'] + "</p>";
                document.getElementById("unscheduled").appendChild(unscheduled_section);
            }
            else {
                var section_event = {
                    title: section['course'],
                    id: id,
                    //TODO add start and end date functionality
                    start: start_formatted,
                    end: end_formatted,
                    dow: section['dow'],
                    section: section['section'],
                    instructor: section['instructor'],
                    room: section['room'],
                    overview: section['overview'],
                    requirements: section['requirements']
                }
                $('#calendar').fullCalendar('renderEvent', section_event, 'stick');
            }

            // Increment number of courses
            var num = parseInt(document.getElementById("number_of_courses").innerHTML) + 1;
            document.getElementById("number_of_courses").innerHTML = num;

            // Increment hours per week
            var total_hrs = 0;
            var cal_events = $('#calendar').fullCalendar('clientEvents', idOrFilter = id);
            for (var j = 0; j < cal_events.length; j++){
                var start = cal_events[j]['start'].toDate();
                var end = cal_events[j]['end'].toDate();
                var min = (end - start) / 60000;
                // in case of unscheduled courses
                if (isNaN(min)){
                    min = 0;
                }
                if (min % 30 == 20){
                    min += 10;
                }
                total_hrs += parseFloat(min) / 60;
            }
            var old_hr = parseFloat(document.getElementById("course_hours").innerHTML);
            document.getElementById("course_hours").innerHTML = old_hr + total_hrs;
        });
    });
}

function add_section(id){
    if (idbSupported){ add_section_supported(id); }
    else { add_section_not_supported(id); }
}

function re_add_section(id, data, desc){
    var section = data;

    // Add to CAESAR Panel
    var CAESAR_div = document.createElement('div');
    CAESAR_div.setAttribute('id', 'CAESAR' + id);
    CAESAR_div.innerHTML = section['course'] + "<ul><li>" + section['univ_num'] + "</li></ul>";
    document.getElementById("CAESAR").appendChild(CAESAR_div);

    // Adding info to cart
    // Create containing div
    var section_data = document.createElement('div');
    section_data.setAttribute('class', 'section_cart panel panel-default');
    section_data.setAttribute('id', id);

    // Populate div with content

    // Create panel heading and panel
    var panel_head = document.createElement('div');
    panel_head.setAttribute('class', 'panel-heading');

    var panel_row = document.createElement('div');
    panel_row.setAttribute('class', 'row');

    panel_head.appendChild(panel_row);

        var panel_title = document.createElement('h4');
        panel_title.setAttribute('class', 'panel-title col-md-11');
        panel_title.innerHTML = "<a data-toggle='collapse' href='#" + id + "_collapse'>" + section['course'] + "</a>";

        panel_row.appendChild(panel_title);

    var panel = document.createElement('div');
    panel.setAttribute('class', 'panel-collapse collapse');
    panel.setAttribute('id', id + '_collapse');

                        var panel_body = document.createElement('div');
                        panel_body.setAttribute('class', 'panel-body');
                        panel.appendChild(panel_body);
                        
                                var course_p = document.createElement('p');
                                course_p.innerHTML = "<h4><b>" + section['course'] + "</b></h4>";

                                var section_p = document.createElement('p');
                                section_p.innerHTML = "Section " + section['section'];
                                
                                var instructor_p = document.createElement('p');
                                instructor_p.innerHTML = section['instructor'];

                                var room_p = document.createElement('p');
                                room_p.innerHTML = section['room'];

                                var overview_p = document.createElement('p');
                                overview_p.innerHTML = "<b>Overview:</b> " + section['overview'];

                                var requirements_p = document.createElement('p');
                                requirements_p.innerHTML = "<b>Requirements:</b> " + section['requirements'];

                                var univ_num_p = document.createElement('p');
                                univ_num_p.innerHTML = "<b>CAESAR Class Nbr</b> " + section['univ_num'];

                        panel_body.appendChild(course_p);
                        panel_body.appendChild(instructor_p);
                        panel_body.appendChild(section_p);
                        panel_body.appendChild(room_p);
                        panel_body.appendChild(overview_p);
                        panel_body.appendChild(requirements_p);
                        panel_body.appendChild(univ_num_p);

    descriptions = desc;

    if (descriptions != "") {
        var descriptions_link = document.createElement('a');
        descriptions_link.setAttribute('role', 'button');
        descriptions_link.setAttribute('data-toggle', 'collapse');
        descriptions_link.setAttribute('data-target', '#' + id + '_descriptions');
        descriptions_link.innerHTML = "Toggle More Descriptions";
        var descriptions_div = document.createElement('div');
        descriptions_div.setAttribute('class', 'collapse');
        descriptions_div.setAttribute('id', id + '_descriptions');
        for (var key in descriptions){
            var desc_name = document.createElement('b');
            desc_name.innerHTML = key;
            descriptions_div.appendChild(desc_name);
            var desc_desc = document.createElement('p');
            desc_desc.innerHTML = descriptions[key];
            descriptions_div.appendChild(desc_desc);
        }
        panel_body.appendChild(descriptions_link);
        panel_body.appendChild(descriptions_div);
    }

    section_data.appendChild(panel_head);
    section_data.appendChild(panel);

    // Put the course in the cart
    document.getElementById("cart").appendChild(section_data);

    var start_formatted = "2015-10-09" + 'T' + section['start_time'] + ':00';
    var end_formatted = "2015-10-09" + 'T' + section['end_time'] + ':00';

    // Adding course to calendar
    if (section['dow'] == '[]'){
        var unscheduled_section = document.createElement('div');
        unscheduled_section.setAttribute('id', id);
        unscheduled_section.innerHTML = "<p>" + section['course'] + "</p>";
        document.getElementById("unscheduled").appendChild(unscheduled_section);
    }
    else {
        var section_event = {
            title: section['course'],
            id: id,
            //TODO add start and end date functionality
            start: start_formatted,
            end: end_formatted,
            dow: section['dow'],
            section: section['section'],
            instructor: section['instructor'],
            room: section['room'],
            overview: section['overview'],
            requirements: section['requirements']
        }
        $('#calendar').fullCalendar('renderEvent', section_event, 'stick');
    }

    // Increment number of courses
    var num = parseInt(document.getElementById("number_of_courses").innerHTML) + 1;
    document.getElementById("number_of_courses").innerHTML = num;

    // Increment hours per week
    var total_hrs = 0;
    var cal_events = $('#calendar').fullCalendar('clientEvents', idOrFilter = id);
    for (var j = 0; j < cal_events.length; j++){
        var start = cal_events[j]['start'].toDate();
        var end = cal_events[j]['end'].toDate();
        var min = (end - start) / 60000;
        // in case of unscheduled courses
        if (isNaN(min)){
            min = 0;
        }
        if (min % 30 == 20){
            min += 10;
        }
        total_hrs += parseFloat(min) / 60;
    }
    var old_hr = parseFloat(document.getElementById("course_hours").innerHTML);
    document.getElementById("course_hours").innerHTML = old_hr + total_hrs;
                $('#sections_modal').modal('hide')
}

function decrement_hrs(id){
    var total_hrs = 0;
    var cal_events_sect = $('#calendar').fullCalendar('clientEvents', idOrFilter = id);
    var cal_events_comp = $('#calendar').fullCalendar('clientEvents', idOrFilter = id + "_comp");
    var cal_events = cal_events_sect.concat(cal_events_comp);
    for (var j = 0; j < cal_events.length; j++){
        var start = cal_events[j]['start'].toDate();
        var end = cal_events[j]['end'].toDate();
        var min = (end - start) / 60000;
        // in case of unscheduled courses
        if (isNaN(min)){
            min = 0;
        }
        if (min % 30 == 20){
            min += 10;
        }
        total_hrs += parseFloat(min) / 60;
    }
    var old_hr = parseFloat(document.getElementById("course_hours").innerHTML);
    document.getElementById("course_hours").innerHTML = old_hr - total_hrs;
}

function remove_course(id){
    decrement_hrs(id);

    // Remove event from calendar
    $('#calendar').fullCalendar('removeEvents', idOrFilter = id);
    $('#calendar').fullCalendar('removeEvents', idOrFilter = id + "_comp");
    // Remove event from cart
    var children = document.getElementById("cart").children;
    for (var i = 0; i < children.length; i++){
        if (children[i].id == id){
            document.getElementById("cart").removeChild(children[i]);
        }
    }
    // Remove from local storage
    if (typeof(Storage) !== "undefined"){
        for (var i = 0; i < localStorage.length; i++){
            if (localStorage.key(i) == "section_" + id.toString()){
                localStorage.removeItem(localStorage.key(i));
                i--;
            } else if (localStorage.key(i) == "component_" + id.toString()){
                localStorage.removeItem(localStorage.key(i));
                i--;
            }
        }
    }

    // Remove from CAESAR modal
    $("#CAESAR" + id).remove();

    // If the event is unscheduled it, remove it from the unscheduled section
    var unscheduled_children = document.getElementById("unscheduled").children;
    for (var i = 0; i < unscheduled_children.length; i++){
        if (unscheduled_children[i].getAttribute('id') == id){
            unscheduled_children[i].remove();
        }
    }
    // Decrement number of courses
    var num = parseInt(document.getElementById("number_of_courses").innerHTML) - 1;
    document.getElementById("number_of_courses").innerHTML = num;
}

$(document).ready(function(){
    // Load calendar
    $('#calendar').fullCalendar({
        googleCalendarApiKey: 'AIzaSyDEbFn8eSO-K5iIv3LerSaHyonOC7plNcE',
        defaultView: 'agendaWeek',
        //editable: true,
        weekends: false,
        header: false,
        columnFormat: 'ddd',
        height: "auto",
        minTime: "07:00:00",
        maxTime: "22:00:00",
        allDaySlot: false,
        eventColor: '#520063',
        eventRender: function(event, element){
            element[0].setAttribute('data-toggle', 'popover');
            element[0].setAttribute('title', "<b>" + event.title + "</b>");
            var is_comp = false;
            if (event.id.substring(event.id.length - 5) == "_comp"){
                is_comp = true;
            }
            if (event.instructor == undefined){
                if (event.room == "" && is_comp){
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.component);
                } else if (event.room == "") {
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.component);
                } else if (is_comp){
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.room + "<br>" + event.component);
                } else{
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.room + "<br>" + event.component);
                }
            } else {
                if (event.room == "" && is_comp){
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.instructor);
                } else if (event.room == ""){
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.instructor);
                } else if (is_comp){
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.room + "<br>" + event.instructor);
                } else{
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.room + "<br>" + event.instructor);
                }
            }
            // Make sure it stays open when you move your mouse over to it
            $(element[0]).popover({
                animation: false,
                html: true,
                trigger: 'manual',
            }).on("mouseenter", function(){
                var _this = this;
                $(this).popover("show");
                $(".popover").on("mouseleave", function(){
                    $(_this).popover('hide');
                });
            }).on("mouseleave", function(){
                var _this = this;
                setTimeout(function(){
                    if (!$(".popover:hover").length){
                        $(_this).popover("hide");
                    }
                }, 300);
            });
        }
    });

    $.getJSON("/shared_data/" + $('#share_link').attr('data-pagekey'), function(storedData){
        for (var key in storedData){
            if (storedData.hasOwnProperty(key)) {
                if (key.split("_")[0] == "component"){
                    dataobj = JSON.parse(storedData[key]);
                    re_add_component(dataobj['component_symbol'], dataobj['id'], dataobj['data']);
                } else if (key.split("_")[0] == "section"){
                    dataobj = JSON.parse(storedData[key]);
                    re_add_section(dataobj['id'], dataobj['data'], dataobj['desc']);
                }
            }
        }
    });

});
