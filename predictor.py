from flask import Flask, request, jsonify
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)


with open('model/model_pipeline.pkl', 'rb') as f:
    model = pickle.load(f)

with open('model/disease_predictor.pkl', 'rb') as f:
    disease_model = pickle.load(f)

with open('model/target_encoder.pkl','rb') as fd:
    target_encoder=pickle.load(fd)

with open('model/other_medicine_predictor.pkl','rb') as f:
    medicine_predictor=pickle.load(f)

with open('model/other_target_2_encoder.pkl','rb') as f:
    target_2_encoder=pickle.load(f)

with open('model/crowd_model.pkl', 'rb') as f:
    crowd_model = pickle.load(f)


@app.route('/predict', methods=['POST'])
def predict_travel():
    data = request.get_json()
    input_df = pd.DataFrame([data])
    prediction = model.predict(input_df)
    return jsonify({'prediction': prediction.tolist()})


@app.route('/predict_disease', methods=['POST'])
def predict_disease():
    data = request.get_json()
    input_df = pd.DataFrame([data])
    prediction = disease_model.predict(input_df)
    
    new_prediction = target_encoder.inverse_transform(prediction)
    
    return jsonify({'prediction': new_prediction.tolist()})


@app.route('/predict_medicine',methods=['POST'])
def predict_medicine():
    data=request.get_json()
    input_df= pd.DataFrame([data])
    prediction=medicine_predictor.predict(input_df)
    new_prediction = target_2_encoder.inverse_transform(prediction)
    return jsonify({'prediction':new_prediction.tolist()}) 

@app.route('/predict_crowd', methods=['POST'])
def predict_crowd():
    try:
        data = request.get_json()

        # convert date
        dt = pd.to_datetime(data["Date"])

        # build full input for model
        input_data = {
        "Place": data["Place"],
        "State": data["State"],
        "Weather": data["Weather"],
        "Event": data["Event"],
        "Region": data["Region"],
        "Transportation_Type": data["Transportation_Type"],
        "day": dt.day,
        "month": dt.month,
        "hour": dt.hour,
        "Day_of_Week": dt.day_name(),
        "isWeekend": 1 if dt.weekday() >= 5 else 0
        }

        df = pd.DataFrame([input_data])

        prediction = crowd_model.predict(df)

        return jsonify({
            "prediction": round(float(prediction[0]),4) * 100
        })

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == '__main__':
    app.run(port=5000)
