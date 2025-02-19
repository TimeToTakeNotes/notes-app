// Handles adding and removing tags.
export const addTag = (
    event: React.KeyboardEvent<HTMLInputElement>,
    tagInput: string,
    tags: string[],
    setTags: React.Dispatch<React.SetStateAction<string[]>>,
    setTagInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const trimmedTag = tagInput.trim();
      if (trimmedTag.length > 0 && trimmedTag.length <= 50 && tags.length < 3) {
        setTags([...tags, trimmedTag]);
        setTagInput("");
      } else if (tags.length >= 3) {
        alert("Maximum of 3 tags allowed.");
      } else if (trimmedTag.length > 50) {
        alert("Tag length cannot exceed 50 characters.");
      }
    }
  };
  
  export const removeTag = (
    indexToRemove: number,
    tags: string[],
    setTags: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };  