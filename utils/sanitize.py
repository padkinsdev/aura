def sanitary(dirty_input):
    """
    Checks if the input contains invalid characters
    """
    illegal_chars = ["?", "&", "\\", "'", "|", ";"]
    for char in illegal_chars:
        if (dirty_input.find(char) >= 0):
            return False
    return True
