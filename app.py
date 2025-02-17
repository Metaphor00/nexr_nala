from flask import Flask, render_template, request, redirect, url_for, send_from_directory, make_response
from flask_cors import CORS
from pyngrok import ngrok, conf
import logging
import os
import qrcode
from werkzeug.utils import secure_filename
from functools import wraps

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask configuration
app = Flask(__name__, static_folder='static')
app.config['UPLOAD_FOLDER'] = 'static/3d_models/'
app.config['ALLOWED_EXTENSIONS'] = {'glb'}

# Configure CORS with exposed headers
CORS(app, expose_headers=['ngrok-skip-browser-warning'])

# Decorator for ngrok headers
def add_ngrok_headers(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        response = make_response(f(*args, **kwargs))
        response.headers['ngrok-skip-browser-warning'] = 'true'
        return response
    return decorated_function

# Ngrok configuration
NGROK_URL = "arachnid-renewing-preferably.ngrok-free.app"

try:
    ngrok.kill()
    ngrok.set_auth_token('2sGqwZW5s3PfTjWAZVoyiHKymuY_77aicHBc9XPjZujezr8a7')
    public_url = ngrok.connect(addr="80", hostname=NGROK_URL)
    logger.info(f"Ngrok URL: {public_url}")
except Exception as e:
    logger.error(f"Ngrok connection failed: {e}")
    public_url = NGROK_URL

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/', methods=['GET', 'POST'])
@add_ngrok_headers
def index():
    if request.method == 'POST':
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            viewer_url = f"https://{NGROK_URL}/view-model/{filename}"
            qr = qrcode.make(viewer_url)
            qr_path = os.path.join(app.config['UPLOAD_FOLDER'], "qrcode.png")
            qr.save(qr_path)
            
            return render_template('index.html', 
                                qr_code_path="static/3d_models/qrcode.png",
                                public_url=viewer_url)
    return render_template('index.html')

@app.route('/view-model/<filename>')
@add_ngrok_headers
def view_model(filename):
    if not allowed_file(filename):
        return "Invalid file type", 400
        
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(filename))
    if not os.path.exists(file_path):
        return "File not found", 404
        
    return render_template('viewer.html', model_file=f"/static/3d_models/{filename}")

@app.route('/static/3d_models/<filename>')
@add_ngrok_headers
def serve_model(filename):
    response = send_from_directory(
        app.config['UPLOAD_FOLDER'],
        filename,
        mimetype='model/gltf-binary'
    )
    return response

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=80)