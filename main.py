import webbrowser
import os
import threading
import json
import glob
import numpy as np


def scanProj(root, include=['*']):
    '''
        return the scan of the project root.
        include (optional): list.  file extensions to include. Default is all file extensions.
    '''
    out = []
    os.chdir(root)
    for extension in include:
        extensionFiles = list(glob.iglob(f"**{os.path.sep}*.{extension}", recursive=True))
        for i, file in enumerate(extensionFiles):

            # to track progress
            print(f"({i}/{len(extensionFiles)}).{extension} " + file)

            fp = os.path.join(root, file)
            with open(fp, 'r', encoding="utf8") as f:
                data = {}

                #######################################
                # set attributes to be passed to blob #
                #######################################
                data["name"] = file
                data["n_lines"] = len(f.readlines()); f.seek(0)
                if data["n_lines"] == 0:
                    data["line_len_std"] = 0
                else:
                    data["line_len_std"] = np.std(list([len(line) for line in f.readlines()]))

                #######################################

                out.append(data)
    return out

# server to serve static files
def start_server():
    dir_path = os.path.dirname(os.path.realpath(__file__))
    os.chdir(dir_path)
    os.system("python -m http.server 8001")



if __name__ == "__main__":

    include = [
        'ts',
        'js',
        'jsx',
        "py"
    ]

    # scan project
    project_scan = scanProj(r"C:\Users\grego\OneDrive\Projects\Python Projects\Instruments", include=include)
    print("Generating", len(project_scan), "blobs. Enjoy!", sep=" ")

    # save to out.json
    out_fp = os.path.join(os.path.dirname(os.path.realpath(__file__)), "out.json")
    with open(out_fp, 'w') as f:
        json.dump(project_scan, f)

    # start server and open index.html
    threading.Thread(target=start_server).start()
    url = 'http://localhost:8001'
    webbrowser.open(url, new=2)  # open in new tab