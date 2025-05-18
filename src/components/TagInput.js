// src/components/TagInput.js

import React, { useState, useRef } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";

const TagInput = ({ tags, setTags }) => {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  const handleTagSubmit = () => {
    const trimmedText = text.trim();
    if (trimmedText !== "") {
      setTags((prevTags) => [...prevTags, trimmedText]);
      setText("");

      // Reenfocar el input sin usar setTimeout
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
    }
  };

  return (
    <View style={styles.tagContainer}>
      <View style={styles.tagList}>
        {tags.map((tag, index) => (
          <TouchableOpacity key={index} style={styles.tag} onPress={() => setTags(tags.filter((_, i) => i !== index))}>
            <Text style={styles.tagText}>{tag} ✕</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        value={text}
        onChangeText={setText}
        placeholder="Palabras clave"
        style={styles.inputTag}
        returnKeyType="done"
        onSubmitEditing={handleTagSubmit}
        blurOnSubmit={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  tag: {
    backgroundColor: "#007bff",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    color: "#fff",
  },
  inputTag: {
    height: 40,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
});

export default TagInput;
