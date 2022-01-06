    

import os.path
import yaml

# f = open(os.path.dirname(__file__) + '/../brownie-config.yml')
# print(f)

current_directory = os.path.dirname(__file__)
parent_directory = os.path.split(current_directory)[0] # Repeat as needed
parent_parent_directory = os.path.split(parent_directory)[0] # Repeat as needed

file_path = os.path.join(parent_parent_directory, 'front_end/src/App.tsx')
f = open(file_path)
print(f)

