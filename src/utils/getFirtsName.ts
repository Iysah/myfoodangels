export const getFirstName = (fullName: string | undefined): string => {
    if (!fullName) return '';
    
    // Split the full name by spaces and return the first part
    const nameParts = fullName.split(' ');
    return nameParts[0];
};