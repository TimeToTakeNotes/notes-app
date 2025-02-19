// Manages sidebar interactions and category selection.
export const toggleSidebar = (
    isSidebarOpen: boolean,
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setIsSidebarOpen(!isSidebarOpen);
};
  
export const handleCategoryClick = (
    category: string,
    setSelectedCategory: React.Dispatch<React.SetStateAction<string>>,
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setSelectedCategory(category);
    setIsSidebarOpen(false);
};
  
export const burgerMouseEnter = (
    setIsHovered: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setIsHovered(true);
};
  
export const burgerMouseLeave = (
    setIsHovered: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setIsHovered(false);
};  