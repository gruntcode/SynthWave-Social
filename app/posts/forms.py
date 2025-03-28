from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length

class PostForm(FlaskForm):
    body = TextAreaField('What\'s on your mind?', validators=[
        DataRequired(), Length(min=1, max=500)
    ])
    media = FileField('Add Media', validators=[
        FileAllowed(['jpg', 'png', 'gif', 'mp4', 'mov', 'pdf', 'doc', 'docx', 'mp3'], 
                    'Images, videos, documents, and audio files are allowed!')
    ])
    submit = SubmitField('Post')

class CommentForm(FlaskForm):
    body = TextAreaField('Add a comment', validators=[
        DataRequired(), Length(min=1, max=200)
    ])
    submit = SubmitField('Comment')
