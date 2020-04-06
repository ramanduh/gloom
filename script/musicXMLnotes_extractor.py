#!/usr/bin/env python
# -*- coding: utf-8 -*-

import xml.etree.ElementTree as ET
from os.path import basename
import sys


def extract_notes(filename, dest_file_prefix="notes"):
    """ Read a musicXML file and extract only the technical notes:
        ie: string, fret

    Result: create a file dest_file_prefix.filename at the current dir
    """
    tree = ET.parse(filename)
    filename = basename(filename)
    root = tree.getroot()

    res_root = ET.Element("notes")
    for technical in root.iter('technical'):
        res_root.append(technical)

    tree = ET.ElementTree(res_root)
    tree.write("{prefix:s}.{filename:s}".format(prefix=dest_file_prefix,
                                                filename=filename))


if __name__ == "__main__":
    extract_notes(sys.argv[1])
