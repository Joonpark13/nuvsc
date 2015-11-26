import os
from flask import Flask, render_template, request
from flask_sslify import SSLify
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import desc, exc
from sqlalchemy import orm

import random
import string
import json
from nuapiclient import NorthwesternAPIClient


def convertDaysToDOW(section_str):
    if section_str == None:
        return []
    days = [section_str[x:x + 2] for x in range(0, 
        len(section_str), 2)]
    dow_list = []
    for day in days:
        if day == 'Mo': dow_list.append(1)
        elif day == 'Tu': dow_list.append(2)
        elif day == 'We': dow_list.append(3)
        elif day == 'Th': dow_list.append(4)
        elif day == 'Fr': dow_list.append(5)
    return dow_list
    
def convertDOWToDays(dow):
    meeting_str = ""
    meeting_days = dow[1:len(dow) - 1].split(",")
    for day in meeting_days:
        if day == '1' or day == ' 1': meeting_str += "M"
        elif day == '2' or day == ' 2': meeting_str += "Tu"
        elif day == '3' or day == ' 3': meeting_str += "W"
        elif day == '4' or day == ' 4': meeting_str += "Th"
        elif day == '5' or day == ' 5': meeting_str += "F"
    return meeting_str


app = Flask(__name__)
sslify = SSLify(app)
app.config.from_object(os.environ['APP_SETTINGS'])
#app.config['PREFERRED_URL_SCHEME'] = 'https'
client = NorthwesternAPIClient(os.environ['NUAPICLIENT_KEY'])
db = SQLAlchemy(app)

class Term(db.Model):
    term_id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String())
    start_date = db.Column(db.String())
    end_date = db.Column(db.String())

    subjects = db.relationship('Subject', backref = 'term', lazy = 'dynamic')
    courses = db.relationship('Course', backref = 'term', lazy = 'dynamic')
    sections = db.relationship('Section', backref = 'term', lazy = 'dynamic')
    descriptions = db.relationship('Description', backref = 'term', lazy = 'dynamic')
    components = db.relationship('Component', backref = 'term', lazy = 'dynamic')

    def __init__(self, term_id, name, start_date, end_date, subjects, courses, sections, descriptions, components):
        self.term_id = term_id
        self.name = name
        self.start_date = start_date
        self.end_date = end_date

        self.subjects = subjects
        self.courses = courses
        self.sections = sections
        self.descriptions = descriptions
        self.components = components

    def __repr__(self):
        return '<{0}, term id = {1}>'.format(self.name, self.term_id)

class School(db.Model):
    school_symbol = db.Column(db.String(), primary_key = True)
    name = db.Column(db.String())

    subjects = db.relationship('Subject', backref = 'school', lazy = 'dynamic')

    def __init__(self, school_symbol, name, subjects):
        self.school_symbol = school_symbol
        self.name = name

        self.subjects = subjects

    def __repr__(self):
        return '<{0}, school symbol = {1}>'.format(self.name, self.school_symbol)

class Subject(db.Model):
    subject_symbol = db.Column(db.String(), primary_key = True)
    symbol = db.Column(db.String())
    name = db.Column(db.String())

    term_id = db.Column(db.Integer, db.ForeignKey('term.term_id'))
    school_symbol = db.Column(db.String(), db.ForeignKey('school.school_symbol'))

    courses = db.relationship('Course', backref = 'subject', lazy = 'dynamic')

    def __init__(self, subject_symbol, symbol, name, courses):
        self.subject_symbol = subject_symbol
        self.symbol = symbol
        self.name = name

        self.courses = courses

    def __repr__(self):
        return '<{0}>'.format(self.name)

class Course(db.Model):
    course_symbol = db.Column(db.String(), primary_key = True)
    course_name = db.Column(db.String())

    subject_symbol = db.Column(db.String(), db.ForeignKey('subject.subject_symbol'))
    term_id = db.Column(db.Integer(), db.ForeignKey('term.term_id'))

    sections = db.relationship('Section', backref = 'course', lazy = 'dynamic')

    def __init__(self, course_symbol, course_name, sections):
        self.course_symbol = course_symbol
        self.course_name = course_name
        
        self.sections = sections

class Section(db.Model):
    section_id = db.Column(db.Integer, primary_key = True)
    catalog_num = db.Column(db.String())
    title = db.Column(db.String())
    dow = db.Column(db.String())
    meeting_days = db.Column(db.String())
    start_time = db.Column(db.String())
    end_time = db.Column(db.String())
    instructor = db.Column(db.String())
    section = db.Column(db.String())
    room = db.Column(db.String())
    overview = db.Column(db.String())
    requirements = db.Column(db.String())
    univ_num = db.Column(db.Integer)

    term_id = db.Column(db.Integer(), db.ForeignKey('term.term_id'))
    course_symbol = db.Column(db.String(), db.ForeignKey('course.course_symbol'))

    descriptions = db.relationship('Description', backref = 'section', lazy = 'dynamic')
    components = db.relationship('Component', backref = 'section', lazy = 'dynamic')
    
    def __init__(self, section_id, catalog_num, title, dow, meeting_days, start_time, end_time, instructor, section, room, overview, requirements, univ_num, descriptions, components):
        self.section_id = section_id
        self.catalog_num = catalog_num
        self.title = title
        self.dow = dow
        self.meeting_days = meeting_days
        self.start_time = start_time
        self.end_time = end_time
        self.instructor = instructor
        self.section = section
        self.room = room
        self.overview = overview
        self.requirements = requirements
        self.univ_num = univ_num

        self.descriptions = descriptions
        self.components = components

    def __repr__(self):
        return '<{0} Section {1}>'.format(self.course, self.section) 

class Description(db.Model):
    description_symbol = db.Column(db.String(), primary_key = True)
    description_id = db.Column(db.Integer)
    name = db.Column(db.String())
    description = db.Column(db.String())

    term_id = db.Column(db.Integer, db.ForeignKey('term.term_id'))
    section_id = db.Column(db.Integer, db.ForeignKey('section.section_id'))

    def __init__(self, description_symbol, description_id, name, description):
        self.description_symbol = description_symbol
        self.description_id = description_id
        self.name = name
        self.description = description

    def __repr__(self):
        return '<{0}, description id = {1}>'.format(self.name, self.description_id)

class Component(db.Model):
    component_symbol = db.Column(db.String(), primary_key = True)
    component_id = db.Column(db.Integer)
    component = db.Column(db.String())
    dow = db.Column(db.String())
    meeting_days = db.Column(db.String())
    start_time = db.Column(db.String())
    end_time = db.Column(db.String())
    component_section = db.Column(db.String())
    room = db.Column(db.String())

    term_id = db.Column(db.Integer, db.ForeignKey('term.term_id'))
    section_id = db.Column(db.Integer, db.ForeignKey('section.section_id'))

    def __init__(self, component_symbol, component_id, component, dow, meeting_days, start_time, end_time, component_section, room):
        self.component_symbol = component_symbol
        self.component_id = component_id
        self.component = component
        self.dow = dow
        self.meeting_days = meeting_days
        self.start_time = start_time
        self.end_time = end_time
        self.component_section = component_section
        self.room = room

class Shared(db.Model):
    pagekey = db.Column(db.String(), primary_key = True)
    classesList = db.Column(db.String())

    def __init__(self, pagekey, classesList):
        self.pagekey = pagekey
        self.classesList = classesList

def update_terms():
    old_terms = Term.query.all()
    new_terms = client.terms()

    # For each new term, see if it exists. If not, add it.
    counter = 0
    for new_term in new_terms:
        if new_term['id'] not in [x.term_id for x in old_terms]:
            db.session.add(Term(new_term['id'], new_term['name'], new_term['start_date'], new_term['end_date'], [], [], [], [], []))
            counter += 1
    db.session.commit()
    print "{0} terms added.".format(counter)

def update_schools():
    old_schools = School.query.all()
    new_schools = client.schools()

    counter = 0
    for new_school in new_schools:
        if new_school['symbol'] not in [x.school_symbol for x in old_schools]:
            db.session.add(School(new_school['symbol'], new_school['name'], []))
            counter += 1
    db.session.commit()
    print "{0} schools added.".format(counter)

def update_subjects(term_id):
    # Get the new subjects for the specified term by school
    new_subjects = []
    for school in School.query.all():
        new_subjects_per_school = client.subjects(term = term_id, school = school.school_symbol)
        # Add the school as a property to each subject
        for sub in new_subjects_per_school:
            sub['school'] = school.school_symbol
        new_subjects += new_subjects_per_school

    counter = 0
    for new_subject in new_subjects:
        new_subject_symbol = str(term_id) + " " + new_subject['symbol'] + ' ' + new_subject['school']
        try:
            new_subject_obj = Subject(new_subject_symbol, new_subject['symbol'], new_subject['name'], [])
            Term.query.filter_by(term_id = term_id).first().subjects.append(new_subject_obj)
            School.query.filter_by(school_symbol = new_subject['school']).first().subjects.append(new_subject_obj)
            db.session.add(new_subject_obj)
            db.session.commit()
            counter += 1
        except exc.IntegrityError:
            db.session.rollback()
    print "{0} subjects added".format(counter)

def update_courses(term_id):
    # Get the new courses for the specified term
    new_courses = []
    #new_courses += client.courses_details(term = most_recent_term.term_id, subject = Subject.query.filter_by(term_id = most_recent_term.term_id).all()[0])
    for subject in Subject.query.filter_by(term_id = term_id).all():
        new_courses += client.courses_details(term = term_id, subject = subject.symbol)

    counter = 0
    for new_course in new_courses:
        new_course_name = new_course['subject'] + ' ' + new_course['catalog_num'] + ' ' + new_course['title']
        new_course_symbol = str(term_id) + " " + new_course['school'] + ' ' + new_course_name
        #if new_course_name not in [x.course_name for x in old_courses]:
        new_course_obj = Course(new_course_symbol, new_course_name, [])
        try:
            Term.query.filter_by(term_id = term_id).first().courses.append(new_course_obj)
            Subject.query.filter_by(subject_symbol = str(term_id) + " " + new_course['subject'] + ' ' + new_course['school']).first().courses.append(new_course_obj)
            db.session.add(new_course_obj)
            db.session.commit()
            counter += 1
        except exc.IntegrityError:
            db.session.rollback()
        except orm.exc.FlushError:
            db.session.rollback()
    print "{0} courses added.".format(counter)

def update_sections(term_id):
    # Get the new sections for the specified term
    new_sections = []
    for subject in Subject.query.filter_by(term_id = term_id).all():
        new_sections += client.courses_details(term = term_id, subject = subject.symbol)

    counter = 0
    for new_section in new_sections:
        if new_section['room'] is None:
            room_val = ''
        else:
            room_val = new_section['room']['building_name'] + ' ' + new_section['room']['name']

        new_section_obj = Section(new_section['id'],
                                  new_section['catalog_num'],
                                  new_section['title'],
                                  str(convertDaysToDOW(new_section['meeting_days'])),
                                  new_section['meeting_days'],
                                  str(new_section['start_time']),
                                  str(new_section['end_time']),
                                  str(new_section['instructor']['name']),
                                  new_section['section'], room_val,
                                  str(new_section['overview']),
                                  str(new_section['requirements']), new_section['class_num'], [], [])
        try:
            Term.query.filter_by(term_id = term_id).first().sections.append(new_section_obj)
            Course.query.filter_by(course_symbol = str(term_id) + " " + new_section['school'] + ' ' + new_section['subject'] + ' ' + new_section['catalog_num'] + ' ' + new_section['title']).first().sections.append(new_section_obj)
            db.session.add(new_section_obj)
            db.session.commit()
            counter += 1
        except exc.IntegrityError:
            db.session.rollback()
        except orm.exc.FlushError:
            db.session.rollback()
    print "{0} sections added.".format(counter)

def update_descriptions(term_id):
    # Get the new descriptions for the most recent term
    new_descriptions = []
    for subject in Subject.query.filter_by(term_id = term_id).all():
        sections = client.courses_details(term = term_id, subject = subject.symbol)
        for section in sections:
            for i in range(len(section['course_descriptions'])):
                descript = section['course_descriptions'][i]
                new_descriptions.append(
                    {'symbol': str(section['id']) + "_" + str(i),
                     'id':int(section['id']),
                     'name':str(descript['name']),
                     'description':str(descript['desc'])
                    }
                )

    counter = 0
    for new_description in new_descriptions:
        new_desc_obj = Description(new_description['symbol'], new_description['id'], new_description['name'], new_description['description'])
        try:
            Term.query.filter_by(term_id = term_id).first().descriptions.append(new_desc_obj)
            Section.query.filter_by(section_id = new_description['id']).first().descriptions.append(new_desc_obj)
            db.session.add(new_desc_obj)
            counter += 1
            db.session.commit()
        except exc.IntegrityError:
            db.session.rollback()
        except orm.exc.FlushError:
            db.session.rollback()
    print "{0} descriptions added.".format(counter)

def update_components(term_id):
    # Get the new components for the most recent term
    new_components = []
    for subject in Subject.query.filter_by(term_id = term_id).all():
        sections = client.courses_details(term = term_id, subject = subject.symbol)
        for section in sections:
            for i in range(len(section['course_components'])):
                comp = section['course_components'][i]
                new_components.append(
                    {'symbol':str(section['id']) + "_" + str(i),
                     'id':int(section['id']),
                     'component':str(comp['component']),
                     'dow':str(convertDaysToDOW(comp['meeting_days'])),
                     'meeting_days':str(comp['meeting_days']),
                     'start_time':str(comp['start_time']),
                     'end_time':str(comp['end_time']),
                     'section':str(comp['section']),
                     'room':str(comp['room'])
                    }
                )

    counter = 0
    for new_component in new_components:
        new_comp_obj = Component(new_component['symbol'], new_component['id'], new_component['component'], new_component['dow'], new_component['meeting_days'], new_component['start_time'], new_component['end_time'], new_component['section'], new_component['room'])
        try:
            Term.query.filter_by(term_id = term_id).first().components.append(new_comp_obj)
            Section.query.filter_by(section_id = new_component['id']).first().components.append(new_comp_obj)
            db.session.add(new_comp_obj)
            db.session.commit()
            counter += 1
        except exc.IntegrityError:
            db.session.rollback()
    print "{0} components added.".format(counter)


# Serve data
@app.route('/current_term')
def current_term():
    term_obj = Term.query.order_by(desc(Term.term_id)).first()
    return json.dumps({'term_id':term_obj.term_id, 'name':term_obj.name, 'start_date':term_obj.start_date, 'end_date':term_obj.end_date})

@app.route('/all_terms/')
def all_terms():
    terms = Term.query.all()
    terms_json = [{'term_id':x.term_id, 'name':x.name, 'start_date':x.start_date, 'end_date':x.end_date} for x in terms]
    return json.dumps(terms_json)

@app.route('/all_schools/')
def all_schools():
    schools = School.query.all()
    schools_dict = [{'school_symbol':x.school_symbol, 'name':x.name} for x in schools]
    return json.dumps(schools_dict)

@app.route('/all_subjects/')
def all_subjects():
    subjects = Subject.query.all()
    subjects_dict = [{'subject_symbol':x.subject_symbol, 'symbol':x.symbol, 'name':x.name, 'term_id':x.term_id, 'school_symbol':x.school_symbol} for x in subjects]
    return json.dumps(subjects_dict)

@app.route('/all_courses/')
def all_courses():
    courses = Course.query.all()
    courses_dict = [{'course_symbol':x.course_symbol, 'course_name':x.course_name, 'subject_symbol':x.subject_symbol, 'term_id':x.term_id} for x in courses]
    return json.dumps(courses_dict)

@app.route('/all_sections/')
def all_sections():
    sections_list = []
    sections = Section.query.all()
    for section in sections:
        sections_list.append(
                                {'section_id':section.section_id,
                                 'catalog_num':section.catalog_num,
                                 'title':section.title,
                                 'dow':section.dow,
                                 'meeting_days':section.meeting_days,
                                 'start_time':section.start_time,
                                 'end_time':section.end_time,
                                 'instructor':section.instructor,
                                 'section':section.section,
                                 'room':section.room,
                                 'overview':section.overview,
                                 'requirements':section.requirements,
                                 'univ_num':section.univ_num,
                                 'term_id':section.term_id,
                                 'course_symbol':section.course_symbol,
                                 'course':section.course.course_name
                                }
                            )
    return json.dumps(sections_list)

@app.route('/all_components/')
def all_components():
    components = Component.query.all()
    components_dict = [{'component_symbol':x.component_symbol,
                        'component_id':x.component_id,
                        'component':x.component,
                        'dow':x.dow,
                        'meeting_days':x.meeting_days,
                        'start_time':x.start_time,
                        'end_time':x.end_time,
                        'component_section':x.component_section,
                        'room':x.room,
                        'term_id':x.term_id,
                        'section_id':x.section_id,
                        'course':x.section.course.course_name} for x in components]
    return json.dumps(components_dict)

@app.route('/all_descriptions/')
def all_descriptions():
    descriptions = Description.query.all()
    descriptions_dict = [{'description_symbol':x.description_symbol,
                          'description_id':x.description_id,
                          'name':x.name,
                          'description':x.description,
                          'term_id':x.term_id,
                          'section_id':x.section_id} for x in descriptions]
    return json.dumps(descriptions_dict)

@app.route('/search_data/<int:term_id>')
def search_data(term_id):
    courses_list = []
    courses = Course.query.filter_by(term_id = term_id).all()
    for course in courses:
        courses_list.append({'value':course.course_name,
                            'label':course.course_name,
                            'id':course.course_symbol});
    return json.dumps(courses_list)

@app.route('/indexedDBversion')
def indexedDBversion():
    return "1"

# Serve pages
@app.route('/')
def index():
    term_name = Term.query.order_by(desc(Term.term_id))[0].name
    schools = School.query.all()
    return render_template("index.html", term = term_name, schools = schools)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/development')
def development():
    return render_template('development.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/terms_of_service')
def terms_of_service():
    return render_template('terms_of_service.html')

@app.route('/share/', methods = ['GET', 'POST'])
def share():
    if request.method == 'POST':
        localStorage = request.get_json(force = True)
        worked = False
        randomString = ''
        while (not worked):
            randomString = randomString.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for _ in range(6))
            try:
                db.session.add(Shared(randomString, json.dumps(localStorage)))
                db.session.commit()
                worked = True
            except exc.IntegrityError:
                db.session.rollback()
    return randomString

@app.route('/shared_data/<pagekey>')
def shared_data(pagekey):
    return Shared.query.filter_by(pagekey = pagekey).all()[0].classesList

@app.route('/shared/<pagekey>')
def shared(pagekey):
    return render_template('shared.html', pagekey = pagekey)

@app.route('/shared/')
def shared_show():
    return render_template('shared.html')


# If IDB not supported
@app.route('/subjects/<school_symbol>')
def subjects(school_symbol):
    term_id = Term.query.order_by(desc(Term.term_id))[0].term_id
    subjects = Subject.query.filter_by(term_id = term_id, school_symbol = school_symbol)
    subjects_json = [{'subject_symbol':x.subject_symbol, 'name':x.name} for x in subjects]
    return json.dumps(subjects_json)

@app.route('/courses/<subject_symbol>')
def courses(subject_symbol):
    term_id = Term.query.order_by(desc(Term.term_id))[0].term_id
    courses = Course.query.filter_by(term_id = term_id, subject_symbol = subject_symbol).all()
    courses_json = [{'course_name':x.course_name,
                     'course_symbol':x.course_symbol,
                     'subject_symbol':x.subject_symbol} for x in courses]
    return json.dumps(courses_json)

@app.route('/sections/<course_symbol>')
def sections(course_symbol):
    sections = Section.query.filter_by(course_symbol = course_symbol).all()
    sections_json = [
                        {'section_id':x.section_id,
                         'catalog_num':x.catalog_num,
                         'title':x.title,
                         'dow':convertDOWToDays(x.dow),
                         'meeting_days':convertDOWToDays(x.dow),
                         'start_time':x.start_time,
                         'end_time':x.end_time,
                         'instructor':x.instructor,
                         'section':x.section,
                         'course':x.course.course_name,
                         'room':x.room,
                         'overview':x.overview,
                         'requirements':x.requirements,
                        } for x in sections
                    ]
    return json.dumps(sections_json)

@app.route('/section/<int:section_id>')
def section(section_id):
    section = Section.query.filter_by(section_id = section_id).all()[0]
    section_json = [
                        {'section_id':section.section_id,
                         'catalog_num':section.catalog_num,
                         'title':section.title,
                         'dow':section.dow,
                         'meeting_days':convertDOWToDays(section.dow),
                         'start_time':section.start_time,
                         'end_time':section.end_time,
                         'instructor':section.instructor,
                         'section':section.section,
                         'course':section.course.course_name,
                         'room':section.room,
                         'overview':section.overview,
                         'requirements':section.requirements,
                         'univ_num':section.univ_num
                        }
                    ]
    return json.dumps(section_json)

@app.route('/descriptions/<int:section_id>')
def descriptions(section_id):
    descriptions = Description.query.filter_by(section_id = section_id).all()
    desc_dict = {}
    for description in descriptions:
        desc_dict[description.name] = description.description
    return json.dumps(desc_dict)

@app.route('/components/<int:section_id>')
def components(section_id):
    components = Component.query.filter_by(section_id = section_id).all()
    components_dict = [{'component_symbol':x.component_symbol,
                        'component_id':x.component_id,
                        'component':x.component,
                        'dow':x.dow,
                        'meeting_days':x.meeting_days,
                        'start_time':x.start_time,
                        'end_time':x.end_time,
                        'component_section':x.component_section,
                        'room':x.room,
                        'term_id':x.term_id,
                        'section_id':x.section_id,
                        'course':x.section.course.course_name} for x in components]
    """
    comp_dict = {}
    for i in range(len(components)):
        comp_dict['comp' + str(i)] = components[i].component + " " + convertDOWToDays(components[i].dow)+ " " + components[i].start_time + "-" + components[i].end_time + " Section " + components[i].section.section + " " + components[i].room
    """
    return json.dumps(components_dict)

@app.route('/component/<component_symbol>')
def component(component_symbol):
    components = Component.query.filter_by(component_symbol = component_symbol)
    components_dict = [{'component_symbol':x.component_symbol,
                        'component_id':x.component_id,
                        'component':x.component,
                        'dow':x.dow,
                        'meeting_days':x.meeting_days,
                        'start_time':x.start_time,
                        'end_time':x.end_time,
                        'component_section':x.component_section,
                        'room':x.room,
                        'term_id':x.term_id,
                        'section_id':x.section_id,
                        'course':x.section.course.course_name} for x in components]
    return json.dumps(components_dict)

#OLD
@app.route('/all_sections_temp')
def all_sections_temp():
    term_id = Term.query.order_by(desc(Term.term_id))[0].term_id
    sections_list = []
    sections = Section.query.filter_by(term_id = term_id).all()
    for section in sections:
        # Account for unscheduled courses
        meeting_str = ''
        if section.dow != '[]': meeting_str = convertDOWToDays(section.dow)
        section_time  = ""
        if section.start_time != 'None':
            section_time = section.start_time + "-" + section.end_time
        sections_list.append(
                                {'value':section.title,
                                 'desc':meeting_str + " " + section_time,
                                 'label':"<b>" + section.course.course_name + "</b>",
                                 'id':section.section_id,
                                 'catalog_num':section.catalog_num,
                                 'title':section.title,
                                 'dow':section.dow,
                                 'start_time':section.start_time,
                                 'end_time':section.end_time,
                                 'instructor':section.instructor,
                                 'section':section.section,
                                 'course':section.course_symbol
                                }
                            )
    return json.dumps(sections_list)

@app.route('/temp')
def temp():
    return render_template('temp.html')

if __name__ == '__main__':
    app.run()
