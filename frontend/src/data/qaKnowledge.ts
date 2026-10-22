/** Fixed FAQ knowledge for the on-device matcher (50 entries). Not a live LLM. */
export type QAEntry = {
  id: number;
  q: string;
  a: string;
  keywords?: string[];
};

export const QA_PAIRS: QAEntry[] = [
  { id: 1, q: "What is LeafCare AI?", a: "A web app plus FastAPI backend that classifies plant leaf photos into one of 38 disease/health labels from a public benchmark-style dataset. It is for screening and learning, not a replacement for agronomists.", keywords: ["about", "purpose", "app"] },
  { id: 2, q: "How many disease or plant classes are supported?", a: "The model outputs 38 classes (combinations of crop and condition, e.g. Tomato___Early_blight). The Classes page lists them from the live API.", keywords: ["classes", "38", "labels"] },
  { id: 3, q: "Where does the dataset come from?", a: "The original project follows the “New Plant Diseases (Augmented)” dataset on Kaggle. Your local train/valid folders must match that layout for training; inference only needs the SavedModel.", keywords: ["kaggle", "dataset", "source"] },
  { id: 4, q: "Is this medical or legal advice for crops?", a: "No. Outputs are probabilistic guesses from a neural net. Always confirm diagnoses with extension services, labs, or certified experts before acting on chemicals or quarantine.", keywords: ["advice", "disclaimer", "legal"] },
  { id: 5, q: "Does the model draw boxes around diseased spots?", a: "No. It performs whole-image classification. Any “detection” JSON uses a full-frame box for UI compatibility only.", keywords: ["bbox", "detection", "localization"] },
  { id: 6, q: "What backend technology is used?", a: "Python FastAPI serves the TensorFlow SavedModel. Endpoints include /health, /classes, /predict, and /api/detect.", keywords: ["fastapi", "backend", "api"] },
  { id: 7, q: "What frontend stack is used?", a: "React 18, TypeScript, Vite, Tailwind CSS, and React Router. The dev server proxies /api-proxy to your backend when no VITE_API_URL is set.", keywords: ["react", "vite", "frontend"] },
  { id: 8, q: "Which port should the API use?", a: "Examples use 8010 to avoid clashing with other apps on 8000. You can choose any port; set the same URL in Settings or VITE_API_URL.", keywords: ["port", "8010", "8000"] },
  { id: 9, q: "Which port is the React dev server?", a: "By default Vite runs on http://127.0.0.1:5173 as configured in package.json.", keywords: ["5173", "vite", "dev"] },
  { id: 10, q: "What is the /api-proxy path?", a: "In development, Vite forwards requests from /api-proxy/* to http://127.0.0.1:8010/* so the browser avoids CORS issues when the API base is empty.", keywords: ["proxy", "cors", "dev"] },
  { id: 11, q: "What does GET /health return?", a: "JSON like {\"status\":\"ok\",\"model_loaded\":true} after TensorFlow finished loading the SavedModel on the server.", keywords: ["health", "status"] },
  { id: 12, q: "What does GET /classes return?", a: "A list of class name strings sorted to match training (used to map softmax indices to labels).", keywords: ["classes", "endpoint"] },
  { id: 13, q: "How do I call POST /predict?", a: "Send multipart form-data with field name file or image containing JPEG/PNG/WebP/GIF. Response includes predicted_class, confidence, and top5.", keywords: ["predict", "upload", "multipart"] },
  { id: 14, q: "How do I call POST /api/detect?", a: "Same multipart upload. Optional query include_image=true|false. Response uses detections with class_name and confidence plus optional base64 JPEG.", keywords: ["detect", "api"] },
  { id: 15, q: "Which image formats are accepted?", a: "JPEG, PNG, WebP, and GIF are typical. The API inspects magic bytes if the browser sends a generic MIME type.", keywords: ["jpeg", "png", "format"] },
  { id: 16, q: "What is the maximum upload size?", a: "About 15 MB per request, enforced server-side to protect memory.", keywords: ["size", "limit", "mb"] },
  { id: 17, q: "What does confidence mean?", a: "It is the softmax probability of the top class after the model runs on your resized 256×256 RGB input. It is not a calibrated medical certainty.", keywords: ["confidence", "probability", "softmax"] },
  { id: 18, q: "Why show top 5 predictions?", a: "Similar-looking diseases can share features; seeing runners-up helps you judge uncertainty and when to seek a second opinion.", keywords: ["top5", "uncertainty"] },
  { id: 19, q: "How do I enable dark mode?", a: "Use the sun/moon button in the app header or landing nav. You can also toggle it in Settings (saved in localStorage).", keywords: ["dark", "theme", "mode"] },
  { id: 20, q: "Where is prediction history stored?", a: "Only in your browser’s localStorage (last ~20 runs with thumbnail data URLs). Nothing is sent to a third-party analytics service by this demo.", keywords: ["history", "storage", "privacy"] },
  { id: 21, q: "How do I clear my history?", a: "Open the History page and click Clear history, which removes the localStorage key.", keywords: ["clear", "history", "delete"] },
  { id: 22, q: "Can I export a single prediction?", a: "Yes. On the Analyze page after a run, use Download result JSON for structured top5 and metadata.", keywords: ["export", "json", "download"] },
  { id: 23, q: "Where is the trained model file on disk?", a: "Under models/plant_leaf_disease_detector/ as a TensorFlow SavedModel (saved_model.pb plus variables/).", keywords: ["model", "savedmodel", "path"] },
  { id: 24, q: "Why does tf.keras load_model fail on this folder?", a: "Keras 3 often rejects legacy SavedModel folders. Use tf.saved_model.load in Python or the serving_default signature as this project does.", keywords: ["keras", "tensorflow", "load"] },
  { id: 25, q: "Do I need a GPU?", a: "No. CPU inference works but first load can take tens of seconds. A GPU speeds up batch training in Train.ipynb.", keywords: ["gpu", "cpu", "training"] },
  { id: 26, q: "How do I retrain the model?", a: "Open Train.ipynb, point BASE_DIR to your dataset train/valid/test layout, and run cells. Expect long runtime on CPU for full epochs.", keywords: ["train", "notebook", "retrain"] },
  { id: 27, q: "What is the Train.ipynb BASE_DIR?", a: "A path to the folder containing nested train and valid class subfolders (and test images). The notebook README explains the expected structure.", keywords: ["base", "path", "dataset"] },
  { id: 28, q: "Is CORS enabled on the API?", a: "Yes, the FastAPI app allows common origins broadly for local development. Tighten allow_origins in production deployments.", keywords: ["cors", "security"] },
  { id: 29, q: "Swagger shows a weapon detection API on port 8000", a: "Another application is bound to that port. Stop it or run this plant API on 8010 and open the correct /docs.", keywords: ["8000", "weapon", "wrong"] },
  { id: 30, q: "Why were detections empty before?", a: "If you hit a different service or filtered by confidence incorrectly, you could get empty arrays. This project’s /api/detect now returns a full-frame classification row when inference succeeds.", keywords: ["empty", "bug", "detections"] },
  { id: 31, q: "What do underscores mean in class names?", a: "Names use Plant___Condition with three underscores between crop group and the health or disease label, matching the dataset’s folder names.", keywords: ["underscore", "naming", "format"] },
  { id: 32, q: "Are there multiple tomato diseases?", a: "Yes. The tomato family includes several disease classes plus Tomato___healthy in the 38-way list.", keywords: ["tomato", "diseases"] },
  { id: 33, q: "Which apple issues are in the dataset?", a: "Examples include Apple___Apple_scab, Apple___Black_rot, Apple___Cedar_apple_rust, and Apple___healthy.", keywords: ["apple", "scab", "rust"] },
  { id: 34, q: "Does it know potato late blight?", a: "The benchmark includes potato disease classes such as Potato___Early_blight and Potato___Late_blight plus healthy.", keywords: ["potato", "blight"] },
  { id: 35, q: "Are grape diseases included?", a: "Yes, e.g. Grape___Black_rot, Grape___Esca, Grape___Leaf_blight, Grape___healthy.", keywords: ["grape"] },
  { id: 36, q: "Is corn (maize) covered?", a: "Yes, classes like Corn___Cercospora_leaf_spot Gray_leaf_spot, Corn___Common_rust, Corn___Northern_Leaf_Blight, Corn___healthy.", keywords: ["corn", "maize"] },
  { id: 37, q: "What does a healthy class mean?", a: "It means the training images for that crop were labeled as healthy leaves in the dataset; it does not guarantee your field is disease-free.", keywords: ["healthy", "meaning"] },
  { id: 38, q: "Will blur hurt accuracy?", a: "Yes. Blurry, tiny, or badly lit leaves reduce confidence and can push the model toward wrong similar classes.", keywords: ["blur", "quality", "photo"] },
  { id: 39, q: "What lighting is best?", a: "Diffuse daylight or even indoor light with minimal harsh shadow works well. See the Photo tips page for more.", keywords: ["light", "sun", "photo"] },
  { id: 40, q: "Should I photograph one leaf or many?", a: "Crop to one dominant leaf when possible; the classifier assumes one global label for the whole image.", keywords: ["multiple", "leaves", "crop"] },
  { id: 41, q: "The UI says API offline", a: "Start uvicorn from the project root, confirm the port matches Settings or VITE_API_URL, and wait for TensorFlow to finish startup logs.", keywords: ["offline", "error", "connect"] },
  { id: 42, q: "How do I change the API URL in the browser?", a: "Open Settings from the sidebar, enter the base URL without a trailing slash, save and reload. Clear saved URL to fall back to the dev proxy.", keywords: ["settings", "url", "config"] },
  { id: 43, q: "Are my images stored on the server forever?", a: "The API processes uploads in memory for each request; this demo does not persist user images to disk unless you modify the code to do so.", keywords: ["privacy", "storage", "server"] },
  { id: 44, q: "What is TensorBoard used for?", a: "Train.ipynb can log TensorBoard metrics during training. Run tensorboard --logdir tensorboard_logs/fit from the repo root to view curves.", keywords: ["tensorboard", "logs"] },
  { id: 45, q: "What batch size does the notebook use?", a: "The original notebook used 64 with ImageDataGenerator; adjust if you run out of GPU memory.", keywords: ["batch", "size", "training"] },
  { id: 46, q: "How many epochs does training use?", a: "The sample notebook sets EPOCHS=30 with early stopping patience; your hardware and dataset size determine actual stops.", keywords: ["epochs", "training"] },
  { id: 47, q: "What accuracy did the original author report?", a: "See the project README tables for train/validation categorical accuracy (~94% in their run). Your mileage will vary with data and splits.", keywords: ["accuracy", "metrics", "readme"] },
  { id: 48, q: "Is there a confusion matrix plot?", a: "The repository includes plots from the author’s run (e.g. plots/confusion_matrix.jpg). Regenerate after your own training if needed.", keywords: ["confusion", "matrix", "plot"] },
  { id: 49, q: "Can this Q&A bot learn new answers?", a: "No. It matches your text against 50 curated entries only. For new content, edit frontend/src/data/qaKnowledge.ts and rebuild.", keywords: ["bot", "50", "faq", "llm"] },
  { id: 50, q: "Who created the original notebook?", a: "The base model and Train.ipynb are credited to Mayur Garg in the README; this fork adds API and React UI layers.", keywords: ["credit", "author", "mayur"] },
];

export const QA_COUNT = QA_PAIRS.length;
