var idbSupported = false;
var db;
var update_done = [];

var current_term = 0;
var current_school = "";
var current_subject = [];
var current_temp = [];
var comp_selected = true;

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

function insertAfter(newNode, referenceNode){
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function set_current_term(){
    $.get('/static/data/current_term.json', function(termobj){
        current_term = termobj['term_id'];
        var currentTermH4 = document.createElement('h4');
        currentTermH4.innerHTML = "Displaying courses for: <b>" + termobj['name'] + "</b>";
        $('#current_term').append(currentTermH4);
    });
}

// IndexedDB update methods
function update_terms(){
    $.get("/static/data/all_terms.json", function(all_terms){
        // Put a warning message up
        var alertDiv = $(document.createElement('div'));
        alertDiv.attr('class', 'alert alert-warning');
        alertDiv.attr('id', 'update_terms_alert');
        alertDiv.attr('role', 'alert');
        alertDiv.text('Updating Term data, please wait...');
        $("#update_modal-body").append(alertDiv);
        //$("#calendar").before(alertDiv);
        // Initialize objectStore
        var transaction = db.transaction(["term"], "readwrite");
        var store = transaction.objectStore("term");
        // delete old data
        var clearRequest = store.clear();
        // Catch possible error
        clearRequest.onerror = function(e){
            console.log("Error clearing terms: ", e.target.error.name);
        }
        // begin adding
        for (var i = 0; i < all_terms.length; i++){
            var request = store.add(all_terms[i]);
            request.onerror = function(e){
                console.log("Error adding terms: ", e.target.error.name);
            }
        }
        transaction.oncomplete = function(){
            $('#update_terms_alert').remove();
            update_done.push(true);
        }
    });
}

function update_schools(){
    $.get("/static/data/all_schools.json", function(all_schools){
        // Put a warning message up
        var alertDiv = $(document.createElement('div'));
        alertDiv.attr('class', 'alert alert-warning');
        alertDiv.attr('id', 'update_schools_alert');
        alertDiv.attr('role', 'alert');
        alertDiv.text('Updating School data, please wait...');
        $("#update_modal-body").append(alertDiv);
        // Initialize objectStore
        var transaction = db.transaction(["school"], "readwrite");
        var store = transaction.objectStore("school");
        // delete old data
        var clearRequest = store.clear();
        // Catch possible error
        clearRequest.onerror = function(e){
            console.log("Error clearing schools: ", e.target.error.name);
        }
        // begin adding
        for (var i = 0; i < all_schools.length; i++){
            var request = store.add(all_schools[i]);
            request.onerror = function(e){
                console.log("Error adding schools: ", e.target.error.name);
            }
        }
        transaction.oncomplete = function(){
            $('#update_schools_alert').remove();
            update_done.push(true);
        }
    });
}

function update_subjects(){
    $.get("/static/data/all_subjects.json", function(all_subjects){
        // Put a warning message up
        var alertDiv = $(document.createElement('div'));
        alertDiv.attr('class', 'alert alert-warning');
        alertDiv.attr('id', 'update_subjects_alert');
        alertDiv.attr('role', 'alert');
        alertDiv.text('Updating Subject data, please wait...');
        $("#update_modal-body").append(alertDiv);
        // Initialize objectStore
        var transaction = db.transaction(["subject"], "readwrite");
        var store = transaction.objectStore("subject");
        // delete old data
        var clearRequest = store.clear();
        // Catch possible error
        clearRequest.onerror = function(e){
            console.log("Error clearing subjects: ", e.target.error.name);
        }
        // begin adding
        for (var i = 0; i < all_subjects.length; i++){
            var request = store.add(all_subjects[i]);
            request.onerror = function(e){
                console.log("Error adding subjects: ", e.target.error.name);
            }
        }
        transaction.oncomplete = function(){
            $('#update_subjects_alert').remove();
            update_done.push(true);
        }
    });
}

function update_courses(){
    $.get("/static/data/all_courses.json", function(all_courses){
        // Put a warning message up
        var alertDiv = $(document.createElement('div'));
        alertDiv.attr('class', 'alert alert-warning');
        alertDiv.attr('id', 'update_course_alert');
        alertDiv.attr('role', 'alert');
        alertDiv.text('Updating Course data, please wait...');
        $("#update_modal-body").append(alertDiv);
        // Initialize objectStore
        var transaction = db.transaction(["course"], "readwrite");
        var store = transaction.objectStore("course");
        // delete old data
        var clearRequest = store.clear();
        // Catch possible error
        clearRequest.onerror = function(e){
            console.log("Error clearing courses: ", e.target.error.name);
        }
        // begin adding
        for (var j = 0; j < all_courses.length; j++){
            var request = store.add(all_courses[j]);
            request.onerror = function(e){
                console.log("Error adding courses: ", e.target.error.name);
            }
        }
        transaction.oncomplete = function(){
            $('#update_course_alert').remove();
            update_done.push(true);
        }
    });
}

function update_sections(){
    $.get("/static/data/all_sections.json", function(all_sections){
        // Put a warning message up
        var alertDiv = $(document.createElement('div'));
        alertDiv.attr('class', 'alert alert-warning');
        alertDiv.attr('id', 'update_section_alert');
        alertDiv.attr('role', 'alert');
        alertDiv.text('Updating Section data, please wait...');
        $("#update_modal-body").append(alertDiv);
        // Initialize objectStore
        var transaction = db.transaction(["section"], "readwrite");
        var store = transaction.objectStore("section");
        // delete old data
        var clearRequest = store.clear();
        // Catch possible error
        clearRequest.onerror = function(e){
            console.log("Error clearing sections: ", e.target.error.name);
        }
        // begin adding
        for (var j = 0; j < all_sections.length; j++){
            var request = store.add(all_sections[j]);
            request.onerror = function(e){
                console.log("Error adding sections: ", e.target.error.name);
            }
        }
        transaction.oncomplete = function(){
            $('#update_section_alert').remove();
            update_done.push(true);
        }
    });
}

function update_descriptions(){
    $.get("/static/data/all_descriptions.json", function(all_descriptions){
        // Put a warning message up
        var alertDiv = $(document.createElement('div'));
        alertDiv.attr('class', 'alert alert-warning');
        alertDiv.attr('id', 'update_description_alert');
        alertDiv.attr('role', 'alert');
        alertDiv.text('Updating Description data, please wait...');
        $("#update_modal-body").append(alertDiv);
        // Initialize objectStore
        var transaction = db.transaction(["description"], "readwrite");
        var store = transaction.objectStore("description");
        // delete old data
        var clearRequest = store.clear();
        // Catch possible error
        clearRequest.onerror = function(e){
            console.log("Error clearing descriptions: ", e.target.error.name);
        }
        // begin adding
        for (var j = 0; j < all_descriptions.length; j++){
            var request = store.add(all_descriptions[j]);
            request.onerror = function(e){
                console.log("Error adding descriptions: ", e.target.error.name);
            }
        }
        transaction.oncomplete = function(){
            $('#update_description_alert').remove();
            update_done.push(true);
        }
    });
}

function update_components(){
    $.get("/static/data/all_components.json", function(all_components){
        // Put a warning message up
        var alertDiv = $(document.createElement('div'));
        alertDiv.attr('class', 'alert alert-warning');
        alertDiv.attr('id', 'update_component_alert');
        alertDiv.attr('role', 'alert');
        alertDiv.text('Updating Component data, please wait...');
        $("#update_modal-body").append(alertDiv);
        // Initialize objectStore
        var transaction = db.transaction(["component"], "readwrite");
        var store = transaction.objectStore("component");
        // delete old data
        var clearRequest = store.clear();
        // Catch possible error
        clearRequest.onerror = function(e){
            console.log("Error clearing components: ", e.target.error.name);
        }
        // begin adding
        for (var j = 0; j < all_components.length; j++){
            var request = store.add(all_components[j]);
            request.onerror = function(e){
                console.log("Error adding components: ", e.target.error.name);
            }
        }
        transaction.oncomplete = function(){
            $('#update_component_alert').remove();
            update_done.push(true);
        }
    });
}

// Show Subjects
$(document).on('click', '.school_button', function(){
    $('.school_box').css({'display':'none'});
    current_school = this.getAttribute('id');

    // Back link
    var back = document.createElement('div');
    back.setAttribute('class', 'subject_box');
    //TODO change this to creating a button using javascript then appending child
    back.innerHTML = "<button type='button' class='btn btn-default btn-sm' onclick='back(this)'>Back</button>";
    document.getElementById("visual_course_finder").appendChild(back);
    $('#visual_course_finder').append("<br class='subject_box'>");

    if (idbSupported){
        var transaction = db.transaction(["subject"], "readonly");
        var store = transaction.objectStore("subject");
        var index = store.index("school_symbol");
        var keyRange = IDBKeyRange.only(current_school);
        index.openCursor(keyRange).onsuccess = function(e){
            var cursor = e.target.result;
            if (cursor){
                if (cursor.value['term_id'] == current_term){
                    // Generate subject links
                    var subject_box = document.createElement('div');
                    subject_box.setAttribute('class', 'subject_box');
                    subject_box.setAttribute('id', cursor.value['subject_symbol']);
                    subject_box.innerHTML = "<button type='button' class='subject_btn btn btn-primary btn-xs btn-block'>" + cursor.value['name'] + "</button>";
                    document.getElementById("visual_course_finder").appendChild(subject_box);
                }
                cursor.continue();
            }
        }

        transaction.oncomplete = function(){
            var btt_div = document.createElement('div');
            btt_div.setAttribute('class', 'back_to_top subject_box');
            // Back to top button
            var back_to_top = document.createElement('a');
            back_to_top.setAttribute('class', 'btn btn-default btn-xs');
            back_to_top.setAttribute('href', '#btt');
            back_to_top.setAttribute('role', 'button');
            back_to_top.innerHTML = "Back to top";
            
            btt_div.appendChild(back_to_top);
            document.getElementById("visual_course_finder").appendChild(btt_div);
        };
    } else{
        $.get("/subjects/" + current_school, function(subjects){
            // Generate subject links
            var subjects_list = JSON.parse(subjects);
            for (var i = 0; i < subjects_list.length; i++){
                var subject_box = document.createElement('div');
                subject_box.setAttribute('class', 'subject_box');
                subject_box.setAttribute('id', subjects_list[i]['subject_symbol']);
                subject_box.innerHTML = "<button type='button' class='subject_btn btn btn-primary btn-xs btn-block'>" + subjects_list[i]['name'] + "</button>";
                document.getElementById("visual_course_finder").appendChild(subject_box);
            }
            var btt_div = document.createElement('div');
            btt_div.setAttribute('class', 'back_to_top subject_box');
            // Back to top button
            var back_to_top = document.createElement('a');
            back_to_top.setAttribute('class', 'btn btn-default btn-xs');
            back_to_top.setAttribute('href', '#');
            back_to_top.setAttribute('role', 'button');
            back_to_top.innerHTML = "Back to top";
            
            btt_div.appendChild(back_to_top);
            document.getElementById("visual_course_finder").appendChild(btt_div);
        });
    }
});

// Show Courses
$(document).on('click', '.subject_btn', function(){
    // Go through list of open subjects and check if it's already open
    if (checkListedCourses(this)){ return; }
    // Add courses under subject heading
    current_subject.push(this.parentElement.getAttribute('id'));

    // Get all the subject boxes
    var subjects = document.getElementsByClassName("subject_box");
    var subject_box_obj = {};
    for (var j = 0; j < subjects.length; j++){
        // Make sure it's being appended to the subject, not the school 
        // (Some schools have same symbol as some subjects)
        if (subjects[j].getAttribute('id') == current_subject[current_subject.length - 1]){
            // Choose the right subject_box
            subject_box_obj = subjects[j];
        }
    }
    if (idbSupported){
        // Make a ul element
        var subject_ul = document.createElement('ul');
        subject_ul.setAttribute('id', this.parentElement.getAttribute('id') + "_ul");
        // Put the ul element inside of subject_box
        subject_box_obj.appendChild(subject_ul);
        // For every course in subject
        var transaction = db.transaction(["course"], "readonly");
        var store = transaction.objectStore("course");
        var index = store.index("subject_symbol");
        var keyRange = IDBKeyRange.only(current_subject[current_subject.length - 1]);
        index.openCursor(keyRange).onsuccess = function(e){
            var cursor = e.target.result;
            if (cursor){
                var course = cursor.value;
                // Make course link
                var course_link = document.createElement('a');
                course_link.setAttribute('id', course['course_symbol']);
                course_link.setAttribute('class', 'course_link');
                course_link.setAttribute('onclick', "show_sections(this.id)");
                course_link.setAttribute('data-toggle', 'modal');
                course_link.setAttribute('data-target', '#sections_modal');
                course_link.setAttribute('href', 'javascript:;');
                course_link.innerHTML = course['course_name'];
                // Put link inside li element
                var course_li = document.createElement('li');
                course_li.appendChild(course_link);
                // Put li element inside ul
                subject_ul.appendChild(course_li);
                cursor.continue();
            }
        };
    } else{
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            if (xhttp.readyState == 4 && xhttp.status == 200){
                text_data = xhttp.responseText;
                courses_list = parseTextList(text_data);

                // Make a ul element
                var subject_ul = document.createElement('ul');
                subject_ul.setAttribute('id', courses_list[0]['subject'] + "_ul");
                // Put the ul element inside of subject_box
                subject_box_obj.appendChild(subject_ul);
                // For every course in subject
                for (var i = 0; i < courses_list.length; i++){
                    var course = courses_list[i];
                    // Make course link
                    var course_link = document.createElement('a');
                    course_link.setAttribute('id', course['course_symbol']);
                    course_link.setAttribute('class', 'course_link');
                    course_link.setAttribute('onclick', "show_sections(this.id)");
                    course_link.setAttribute('data-toggle', 'modal');
                    course_link.setAttribute('data-target', '#sections_modal');
                    course_link.setAttribute('href', 'javascript:;');
                    course_link.innerHTML = course['course_name'];
                    // Put link inside li element
                    var course_li = document.createElement('li');
                    course_li.appendChild(course_link);
                    // Put li element inside ul
                    subject_ul.appendChild(course_li);
                }
            }
        }
        xhttp.open("GET", "/courses/" + current_subject[current_subject.length - 1], true);
        xhttp.send();
    }
});

function add_section_temp(id){
    // Check if course is aleady in cart
    var sections_in_cart = document.getElementById("cart").children;
    for (var i = 0; i < sections_in_cart.length; i++){
        if (sections_in_cart[i].id == id){
            return;
        }
    }
    if (idbSupported){
        var transaction = db.transaction(["section"], "readonly");
        var store = transaction.objectStore("section");
        var getSection = store.get(id);
        getSection.onsuccess = function(e){
            var section = e.target.result;
            var start_formatted = "2015-10-09" + 'T' + section['start_time'] + ':00';
            var end_formatted = "2015-10-09" + 'T' + section['end_time'] + ':00';

            // Adding course to calendar
            if (section['dow'] == '[]'){
                var unscheduled_section = document.createElement('div');
                unscheduled_section.setAttribute('id', "temp_" + id);
                unscheduled_section.innerHTML = "<p>" + section['course'] + "</p>";
                document.getElementById("unscheduled").appendChild(unscheduled_section);
            }
            else {
                var section_event = {
                    title: section['course'],
                    id: "temp_" + id,
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
                $('#calendar').fullCalendar('renderEvent', section_event);
            }
            //TODO Add a temporarily increasing number of courses and hours per week
        }
    } else{
        $.get("/section/" + id, function(section_request_data){
            var section = JSON.parse(section_request_data)[0];
            var start_formatted = "2015-10-09" + 'T' + section['start_time'] + ':00';
            var end_formatted = "2015-10-09" + 'T' + section['end_time'] + ':00';

            // Adding course to calendar
            if (section['dow'] == '[]'){
                var unscheduled_section = document.createElement('div');
                unscheduled_section.setAttribute('id', "temp_" + id);
                unscheduled_section.innerHTML = "<p>" + section['course'] + "</p>";
                document.getElementById("unscheduled").appendChild(unscheduled_section);
            }
            else {
                var section_event = {
                    title: section['course'],
                    id: "temp_" + id,
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
                $('#calendar').fullCalendar('renderEvent', section_event);
            }
        });
    }
}

function remove_section_temp(id){
    // Remove event from calendar
    $('#calendar').fullCalendar('removeEvents', idOrFilter = "temp_" + id);
    // If the event is unscheduled it, remove it from the unscheduled section
    var unscheduled_children = document.getElementById("unscheduled").children;
    for (var i = 0; i < unscheduled_children.length; i++){
        if (unscheduled_children[i].getAttribute('id') == "temp_" + id){
            unscheduled_children[i].remove();
        }
    }
}

// Closure helper methods
function call_add_section_temp(id){
    return function(){
        add_section_temp(id);
    };
}

function call_remove_section_temp(id){
    return function(){
        remove_section_temp(id);
    };
}

function show_sections(inputid){
    // clear modal
    var modal_ul = document.getElementById('modal_ul');
    var modal_children = modal_ul.children;
    while (modal_ul.firstChild){
        modal_ul.removeChild(modal_ul.firstChild);
    }
    if (idbSupported){
        // Set modal title
        var transaction_title = db.transaction(["section"], "readonly");
        var store_title = transaction_title.objectStore("section");
        var indexTitle = store_title.index("course_symbol");
        var getTitle = indexTitle.get(inputid);
        getTitle.onsuccess = function(e){
            document.getElementById('modal_title').innerHTML = "<b>" + e.target.result['course'] + "</b>";
        }
        // turn into html section links

        var transaction = db.transaction(["section"], "readonly");
        var store = transaction.objectStore("section");
        var index = store.index("course_symbol");
        var keyRange = IDBKeyRange.only(inputid);
        index.openCursor(keyRange).onsuccess = function(e){
            var cursor = e.target.result;
            if (cursor){
                var section = cursor.value;
                var section_link = document.createElement('a');
                section_link.setAttribute('id', section['section_id']);
                section_link.setAttribute('class', 'section_link');
                section_link.setAttribute('onclick', "add_section_visual(this.id)");
                section_link.setAttribute('href', 'javascript:;');
                var times = section['start_time'] + "-" + section['end_time'];
                if (section['start_time'] == 'None'){
                    times = "";
                }
                var days = section["meeting_days"];
                if (section['meeting_days'] == null){
                     days = "Unscheduled";
                }
                section_link.innerHTML = "Section " + section['section'] + "  " + days + " " + times + "  " + section['instructor'];
                // Check if course is aleady in cart
                var sections_in_cart = document.getElementById("cart").children;
                for (var j = 0; j < sections_in_cart.length; j++){
                    // If yes, make link red
                    if (sections_in_cart[j].id == section['id'] && sections_in_cart[j].getAttribute('class').indexOf("section_cart") != -1){
                        section_link.style.color = 'red';
                    }
                }

                var li = document.createElement('li');
                li.setAttribute('id', section['section_id'] + '_li');
                li.setAttribute('class', 'section_li');


                // insert html section links to dialog div
                li.appendChild(section_link);

                var id = section['section_id'];

                // hover functionality
                $(section_link).hoverIntent(call_add_section_temp.call(this, id), call_remove_section_temp.call(this, id));

                document.getElementById('modal_ul').appendChild(li);
                cursor.continue();
            }
        };
    } else{
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            if (xhttp.readyState == 4 && xhttp.status == 200){
                // Get ajax sections info
                text_data = xhttp.responseText;
                sections_list = parseTextList(text_data);
                // Set modal title
                document.getElementById('modal_title').innerHTML = sections_list[0]['course'];
                // turn into html section links
                for (var i = 0; i < sections_list.length; i++){
                    var section = sections_list[i];
                    var section_link = document.createElement('a');
                    section_link.setAttribute('id', section['section_id']);
                    section_link.setAttribute('class', 'section_link');
                    section_link.setAttribute('onclick', "add_section_visual(this.id)");
                    section_link.setAttribute('href', 'javascript:;');
                    var times = section['start_time'] + "-" + section['end_time'];
                    if (section['start_time'] == 'None'){
                        times = "";
                    }
                    var days = section["meeting_days"];
                    if (section['meeting_days'] == null){
                         days = "Unscheduled";
                    }
                    section_link.innerHTML = "Section " + section['section'] + "  " + days + " " + times + "  " + section['instructor'];
                    // Check if course is aleady in cart
                    var sections_in_cart = document.getElementById("cart").children;
                    for (var j = 0; j < sections_in_cart.length; j++){
                        // If yes, make link red
                        if (sections_in_cart[j].id == section['id'] && sections_in_cart[j].getAttribute('class') == "section_cart"){
                            section_link.style.color = 'red';
                        }
                    }

                    var li = document.createElement('li');
                    li.setAttribute('id', section['section_id'] + '_li');
                    li.setAttribute('class', 'section_li');

                    var id = section['section_id'];
                    // insert html section links to dialog div
                    li.appendChild(section_link);
                    // hover functionality
                    $(section_link).hoverIntent(call_add_section_temp.call(this, id), call_remove_section_temp.call(this, id));

                    document.getElementById('modal_ul').appendChild(li);
                }
            }
        }
        xhttp.open("GET", "/sections/" + inputid, true);
        xhttp.send(); 
    }
}

function add_component_temp(symbol, id){
    var comp_link = document.getElementById(symbol);
    if (comp_link.style.color == 'red'){
            return;
    }

    if (idbSupported){
        var transaction = db.transaction(["component"], "readonly");
        var store = transaction.objectStore("component");
        var getComponent = store.get(symbol);
        getComponent.onsuccess = function(e){
            var comp = e.target.result;
            
            var start_formatted = "2015-10-09" + 'T' + comp['start_time'] + ':00';
            var end_formatted = "2015-10-09" + 'T' + comp['end_time'] + ':00';

            // Adding course to calendar
            if (comp['dow'] != '[]'){
                var comp_event = {
                    title: comp['course'],
                    id: "temp_" + id + "_comp",
                    //TODO add start and end date functionality
                    start: start_formatted,
                    end: end_formatted,
                    component: comp['component'],
                    dow: comp['dow'],
                    section: comp['section'],
                    room: comp['room']
                }
                $('#calendar').fullCalendar('renderEvent', comp_event);
            }
        }
    } else{
        $.get("/component/" + symbol, function(comp_data){
            var comp = parseTextList(comp_data)[0];

            var start_formatted = "2015-10-09" + 'T' + comp['start_time'] + ':00';
            var end_formatted = "2015-10-09" + 'T' + comp['end_time'] + ':00';

            // Adding course to calendar
            if (comp['dow'] != '[]'){
                var comp_event = {
                    title: comp['course'],
                    id: "temp_" + id + "_comp",
                    //TODO add start and end date functionality
                    start: start_formatted,
                    end: end_formatted,
                    component: comp['component'],
                    dow: comp['dow'],
                    section: comp['section'],
                    room: comp['room']
                }
                $('#calendar').fullCalendar('renderEvent', comp_event);
            }
        });
    }
}

function remove_component_temp(id){
    // Remove event from calendar
    $('#calendar').fullCalendar('removeEvents', idOrFilter = "temp_" + id + "_comp");
}

// Closure helper methods
function call_add_comp_temp(symbol, id){
    return function(){
        add_component_temp(symbol, id);
    };
}

function call_remove_comp_temp(id){
    return function(){
        remove_component_temp(id);
    };
}

function call_add_section(id){
    return function(){
        add_function(id);
    };
}

// Show components
function add_section_visual(id){
    // Check if course is aleady in cart
    var sections_in_cart = document.getElementById("cart").children;
    for (var i = 0; i < sections_in_cart.length; i++){
        if (sections_in_cart[i].id == id){
            window.alert("This course is already in your cart.");
            return;
        }
    }

    var section_links = document.getElementsByClassName("section_link");
    var section_link = {}
    for (var i = 0; i < section_links.length; i++){
        if (section_links[i].getAttribute('id') == id){
            section_link = section_links[i];
        }
    }
    section_link.style.color = 'red';

    if (idbSupported){
        // See if there are any components for this section
        var components = [];
        var transaction = db.transaction(['component'], 'readonly');
        var store = transaction.objectStore('component');
        //var index = store.index('section_id');
        //var keyRange = IDBKeyRange.only(id);
        store.openCursor().onsuccess = function(e){
            var cursor = e.target.result;
            if (cursor){
                if (cursor.value['section_id'] == id){
                    components.push(cursor.value);
                }
                cursor.continue();
            }
        }

        transaction.oncomplete = function(){
            if (components.length != 0){
                comp_selected = false;

                var comp_panel = document.createElement('div');
                comp_panel.setAttribute('class', 'panel panel-default');
                var comp_heading = document.createElement('div');
                comp_heading.setAttribute('class', 'panel-heading');
                comp_heading.innerHTML = "Choose a component:";
                var comp_body = document.createElement('div');
                comp_body.setAttribute('class', 'panel-body');
                comp_panel.appendChild(comp_heading);
                comp_panel.appendChild(comp_body);
                for (var i = 0; i < components.length; i++){
                    var comp_link = document.createElement('a');
                    comp_link.setAttribute('id', components[i]['component_symbol']);
                    comp_link.setAttribute('class', "component_link");
                    comp_link.setAttribute('href', 'javascript:;');
                    comp_link.style.display = 'block';
                    var meeting_days = components[i]['meeting_days'];
                    if (meeting_days == "None"){
                        meeting_days = "";
                    }
                    var time = components[i]['start_time'] + "-" + components[i]['end_time'] + ", ";
                    if (components[i]['start_time'] == "None"){
                        time = "";
                    }
                    comp_link.innerHTML = "<b>" + components[i]['component'] + ":</b> Section " + components[i]['component_section'] + ", " + meeting_days + " " + time + components[i]['room'];
                    comp_body.appendChild(comp_link);
                    // hover functionality
                    $(comp_link).hoverIntent(
                        call_add_comp_temp.call(this, components[i]['component_symbol'], id),
                        call_remove_comp_temp.call(this, id)
                    );
                }
                insertAfter(comp_panel, section_link);
                add_section(id);
            } else{
                add_section(id);
                $('#sections_modal').modal('hide')
            }
        }
    } else{
        $.get("/components/" + id, function(components_data){
            if (components_data != "[]"){
                comp_selected = false;

                var components = parseTextList(components_data);
                var comp_panel = document.createElement('div');
                comp_panel.setAttribute('class', 'panel panel-default');
                var comp_heading = document.createElement('div');
                comp_heading.setAttribute('class', 'panel-heading');
                comp_heading.innerHTML = "Choose a component:";
                var comp_body = document.createElement('div');
                comp_body.setAttribute('class', 'panel-body');
                comp_panel.appendChild(comp_heading);
                comp_panel.appendChild(comp_body);
                for (var i = 0; i < components.length; i++){
                    var comp_link = document.createElement('a');
                    comp_link.setAttribute('id', components[i]['component_symbol']);
                    comp_link.setAttribute('class', "component_link");
                    comp_link.setAttribute('href', 'javascript:;');
                    comp_link.style.display = 'block';
                    comp_link.innerHTML = "<b>" + components[i]['component'] + ":</b> Section " + components[i]['component_section'] + ", " + components[i]['meeting_days'] + " " + components[i]['start_time'] + "-" + components[i]['end_time'] + ", " + components[i]['room'];
                    comp_body.appendChild(comp_link);
                    // hover functionality
                    $(comp_link).hoverIntent(
                        call_add_comp_temp.call(this, components[i]['component_symbol'], id),
                        call_remove_comp_temp.call(this, id)
                    );
                }
                insertAfter(comp_panel, section_link);
                add_section(id);
            } else {
                add_section(id);
                $('#sections_modal').modal('hide')
            }
        }); 
    }
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

function back(input){

    if (input.parentElement.getAttribute("class") == 'subject_box'){
        if (current_subject != []){
            for (var i = 0; i < current_subject.length; i++){
                checkListedCourses(document.getElementById(current_subject[i]));
            }
        }
        $('.school_box').css({'display':'block'});
        $('.subject_box').remove();
        current_subject = [];
    }
}

$('#share_schedule').click(function(){
    html2canvas(document.body).then(function(canvas) {
        //document.body.appendChild(canvas);
        var imgDataUrl = canvas.toDataURL();
        $('head').append("<meta property='og:image' content='" + imgDataUrl + "' />");
    });

    if ($('#share_url_ul').children().length >= 1){
        $('#share_url_ul').empty();
    }
    // Take care of no classes case "You cannot share an empty schedule."
    $.ajax({
        method: "POST",
        url: "/share/",
        data: JSON.stringify(localStorage),
        contentType: "application/json; charset=utf-8",
        dataType: "text",
        success: function(response){
            var shared_url = document.createElement('a');
            $(shared_url).css('display', 'block');
            $(shared_url).attr('href', window.location.href + 'shared/' + response);
            $(shared_url).attr('id', 'share_link');
            shared_url.innerHTML = window.location.href + 'shared/' + response;
            $('#share_url_ul').append(shared_url);

            $('#fb_share_btn').attr('data-href', window.location.href + 'shared/' + response);

            FB.XFBML.parse();
        },
        error: function(error){
            console.log(error);
        }
    });
});

$(document).ready(function(){
    set_current_term();

    // Check if indexed db is supported
    if ("indexedDB" in window){ idbSupported = true; }
    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1){ idbSupported = false; }

    if (idbSupported){
        // Open database
        var openRequest = indexedDB.open("cache", 1);
        // On first visit
        openRequest.onupgradeneeded = function(e){
            // Put an update message
            /*
            var updateDiv = $(document.createElement('div'));
            updateDiv.attr('class', 'alert alert-success');
            updateDiv.attr('role', 'alert');
            updateDiv.text("");
            $("#calendar").before(updateDiv);
            */

            // If localstorage is supported
            if(typeof(Storage) !== "undefined"){
                // If the version number doesn't exist, initalize it
                if (localStorage.getItem('indexedDBversion') == null){
                    localStorage.setItem('indexedDBversion', 0);
                }
            }
            var thisdb = e.target.result;
            // Initialize objectStores
            // Term
            if (!thisdb.objectStoreNames.contains("term")){
                var objectStore = thisdb.createObjectStore("term", {keyPath:"term_id"});
                // Add properties
                objectStore.createIndex("term_id", "term_id", {unique:true});
                objectStore.createIndex("name", "name", {unique:false});
                objectStore.createIndex("start_date", "start_date", {unique:false});
                objectStore.createIndex("end_date", "end_date", {unique:false});
            }
            // School
            if (!thisdb.objectStoreNames.contains("school")){
                var objectStore = thisdb.createObjectStore("school", {keyPath:"school_symbol"});
                // Add properties
                objectStore.createIndex("school_symbol", "school_symbol", {unique:true});
                objectStore.createIndex("name", "name", {unique:false});
            }
            // Subject
            if (!thisdb.objectStoreNames.contains("subject")){
                var objectStore = thisdb.createObjectStore("subject", {keyPath:"subject_symbol"});
                // Add properties
                objectStore.createIndex("subject_symbol", "subject_symbol", {unique:true});
                objectStore.createIndex("symbol", "symbol", {unique:false});
                objectStore.createIndex("name", "name", {unique:false});
                objectStore.createIndex("term_id", "term_id", {unique:false});
                objectStore.createIndex("school_symbol", "school_symbol", {unique:false});
            }
            // Course
            if (!thisdb.objectStoreNames.contains("course")){
                var objectStore = thisdb.createObjectStore("course", {keyPath:"course_symbol"});
                // Add properties
                objectStore.createIndex("course_symbol", "course_symbol", {unique:true});
                objectStore.createIndex("course_name", "course_name", {unique:false});
                objectStore.createIndex("subject_symbol", "subject_symbol", {unique:false});
                objectStore.createIndex("term_id", "term_id", {unique:false});
            }
            // Section
            if (!thisdb.objectStoreNames.contains("section")){
                var objectStore = thisdb.createObjectStore("section", {keyPath:"section_id"});
                // Add properties
                objectStore.createIndex("section_id", "section_id", {unique:true});
                objectStore.createIndex("catalog_num", "catalog_num", {unique:false});
                objectStore.createIndex("title", "title", {unique:false});
                objectStore.createIndex("dow", "dow", {unique:false});
                objectStore.createIndex("meeting_days", "dow", {unique:false});
                objectStore.createIndex("start_time", "start_time", {unique:false});
                objectStore.createIndex("end_time", "end_time", {unique:false});
                objectStore.createIndex("instructor", "instructor", {unique:false});
                objectStore.createIndex("section", "section", {unique:false});
                objectStore.createIndex("room", "room", {unique:false});
                objectStore.createIndex("overview", "overview", {unique:false});
                objectStore.createIndex("requirements", "requirements", {unique:false});
                objectStore.createIndex("univ_num", "univ_num", {unique:false});
                objectStore.createIndex("term_id", "term_id", {unique:false});
                objectStore.createIndex("course_symbol", "course_symbol", {unique:false});
            }
            // Description
            if (!thisdb.objectStoreNames.contains("description")){
                var objectStore = thisdb.createObjectStore("description", {keyPath:"description_symbol"});
                // Add properties
                objectStore.createIndex("description_symbol", "description_symbol", {unique:true});
                objectStore.createIndex("description_id", "description_id", {unique:false});
                objectStore.createIndex("name", "name", {unique:false});
                objectStore.createIndex("description", "description", {unique:false});
                objectStore.createIndex("term_id", "term_id", {unique:false});
                objectStore.createIndex("section_id", "section_id", {unique:false});
            }
            // Component
            if (!thisdb.objectStoreNames.contains("component")){
                var objectStore = thisdb.createObjectStore("component", {keyPath:"component_symbol"});
                // Add properties
                objectStore.createIndex("component_symbol", "component_symbol", {unique:true});
                objectStore.createIndex("component_id", "component_id", {unique:false});
                objectStore.createIndex("component", "component", {unique:false});
                objectStore.createIndex("dow", "dow", {unique:false});
                objectStore.createIndex("meeting_days", "meeting_days", {unique:false});
                objectStore.createIndex("start_time", "start_time", {unique:false});
                objectStore.createIndex("end_time", "end_time", {unique:false});
                objectStore.createIndex("component_section", "component_section", {unique:false});
                objectStore.createIndex("room", "room", {unique:false});
                objectStore.createIndex("term_id", "term_id", {unique:false});
                objectStore.createIndex("section_id", "section_id", {unique:false});
            }
        }
        // On every visit
        openRequest.onsuccess = function(e){
            db = e.target.result;
            // If localstorage is supported
            if(typeof(Storage) !== "undefined"){
                // Compare version numbers to see if updates are needed
                $.get("/static/data/indexedDBversion", function(version_num){
                    // If updates are needed, run update functions
                    if (parseInt(localStorage.getItem('indexedDBversion')) < parseInt(version_num) || localStorage.getItem('currentlyUpdating') == "true"){
                        $('#update_modal').modal({
                            backdrop:'static',
                            keyboard:false
                        })
                        $('#update_modal').modal('show')
                        localStorage.setItem('currentlyUpdating', true);
                        update_terms();
                        update_schools();
                        update_subjects();
                        update_courses();
                        update_sections();
                        update_descriptions();
                        update_components();
                        // update version number to new version
                        localStorage.setItem('indexedDBversion', version_num);
                        var checking = setInterval(function(){
                            if (update_done.length == 7){
                                clearInterval(checking);
                                localStorage.setItem('currentlyUpdating', false);
                                $('#update_modal').modal('hide')
                            }
                        }, 100);
                    }
                });
            }
        }
    }

    $('#sections_modal').draggable({handle:'.modal-header'});
    // Make sure that for sections with components, you are forced to select a component
    $('#sections_modal').on('hidden.bs.modal', function(){
        if (!comp_selected){
            window.alert("You must select a component.");
            $('#sections_modal').modal('show');
        }
    })

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
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.component + "<br><a onclick='remove_course(" + event.id + ")' href='javascript:;'>Remove</a>");
                } else if (is_comp){
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.room + "<br>" + event.component);
                } else{
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.room + "<br>" + event.component + "<br><a onclick='remove_course(" + event.id + ")' href='javascript:;'>Remove</a>");
                }
            } else {
                if (event.room == "" && is_comp){
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.instructor);
                } else if (event.room == ""){
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.instructor + "<br><a onclick='remove_course(" + event.id + ")' href='javascript:;'>Remove</a>");
                } else if (is_comp){
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.room + "<br>" + event.instructor);
                } else{
                    element[0].setAttribute('data-content', "Section " + event.section + "<br>" + event.room + "<br>" + event.instructor + "<br><a onclick='remove_course(" + event.id + ")' href='javascript:;'>Remove</a>");
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

    // Check if browser supports local storage
    if(typeof(Storage) !== "undefined"){
        // If so, add all saved courses
        var i = 0;
        while (i < localStorage.length){
            if (localStorage.key(i).split("_")[0] == "component"){
                dataobj = JSON.parse(localStorage.getItem(localStorage.key(i)));
                re_add_component(dataobj['component_symbol'], dataobj['id'], dataobj['data']);
            } else if (localStorage.key(i).split("_")[0] == "section"){
                dataobj = JSON.parse(localStorage.getItem(localStorage.key(i)));
                re_add_section(dataobj['id'], dataobj['data'], dataobj['desc']);
            }
            i++;
        }
    } else{
        //TODO Make use of modal, not announcements panel
        // If not, display warning message
        /*
        $('#announcement_panel').css('display', 'initial');
        $('#announcement_body').append("\nYour browser does not support local storage. This means you'll lose your schedule when you close Serif.");
        */
    }

    // Initialize the search
    $.get('/static/data/current_term.json', function(current_term_obj){
        $.get("/static/data/search_data_" + current_term_obj['term_id'] + ".json", function(search_list){
            // get rid of Loading message
            $("#empty_message").empty();
            $("#autocomplete").autocomplete({
                minLength: 3,
                source: function(request, response){
                    var results = $.ui.autocomplete.filter(search_list, request.term);
                    if (request.term.length == 0){
                        $("#empty_message").empty();
                    }
                    if (!results.length){
                        $("#empty_message").text("No results found");
                    } else{
                        $("#empty_message").empty();
                    }
                    response(results);
                },
                autoFocus: true,
                select: function(event, ui){
                    $('#sections_modal').modal('show')
                    show_sections(ui.item.id);
                }
            });
        });
    });
});
