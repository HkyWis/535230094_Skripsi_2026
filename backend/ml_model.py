import os
from catboost import CatBoostRegressor

# Path model
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), 
    "machinelearning", 
    "catboost_model_iqr.cbm"
)

# Load model
model = CatBoostRegressor()
model.load_model(MODEL_PATH)

def predict_estimasi_hari(features: dict) -> int:
    """
    Memprediksi estimasi hari menggunakan CatBoost model.
    """
    # 22 fitur yang dibutuhkan oleh model
    feature_names = [
        "Jenis_Service",
        "Jenis_Produk",
        "Status_Garansi",
        "Jumlah_Keluhan",
        "Keluhan_lcd",
        "Keluhan_keyboard",
        "Keluhan_charger",
        "Keluhan_baterai",
        "Keluhan_engsel",
        "Keluhan_motherboard",
        "Keluhan_storage",
        "Keluhan_memory",
        "Keluhan_booting",
        "Keluhan_kipas",
        "Keluhan_port",
        "Keluhan_software_os",
        "Keluhan_password",
        "Keluhan_touchpad",
        "Keluhan_speaker",
        "Keluhan_part",
        "Keluhan_camera",
        "Keluhan_power"
    ]
    
    # Kita menggunakan input berupa list of values berurutan
    input_data = [features.get(col, 0) for col in feature_names]
    
    # Predict
    pred_value = model.predict([input_data])[0]
    
    return int(round(pred_value))
