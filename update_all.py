import sys
import serif as s

term_id = s.Term.query.filter_by(term_id = sys.argv[1]).first().term_id

s.update_subjects(term_id)
print "Updated Subjects"
s.update_courses(term_id)
print "Updated Courses"
s.update_sections(term_id)
print "Updated Sections"
s.update_descriptions(term_id)
print "Updated Descriptions"
s.update_components(term_id)
print "Updated Components"
