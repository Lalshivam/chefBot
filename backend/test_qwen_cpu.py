from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model_name = "./models/Qwen2.5-0.5B-Instruct"

# CPU-only
device = torch.device("cpu")

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    device_map={"": "cpu"},  # force CPU
    torch_dtype=torch.float32
)

prompt = "Hello! Introduce yourself."
messages = [
    {"role": "system", "content": "You are Qwen, a helpful assistant."},
    {"role": "user", "content": prompt}
]

text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)
model_inputs = tokenizer([text], return_tensors="pt").to(device)

generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=512
)
generated_ids = [
    output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
]

response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]

print(response)
