from flask import Flask, request, jsonify
import pickle
import numpy as np
import pandas as pd
app = Flask(__name__)





if __name__ == '__main__':
    app.run(port=5000)
