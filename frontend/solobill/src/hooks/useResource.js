import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';

export const useResource = (repository, validator, resourceName) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { notify } = useNotification();

    const loadItems = useCallback(async () => {
        try {
            setLoading(true);
            const data = await repository.getAll();
            setItems(data);
        } catch (error) {
            console.error(`Failed to load ${resourceName}s`, error);
            notify(`Failed to load ${resourceName}s`, 'error');
        } finally {
            setLoading(false);
        }
    }, [repository, resourceName, notify]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const save = async (data, additionalFields) => {
        const { isValid, errors } = validator.validate(data);

        if (!isValid) {
            return { success: false, errors };
        }

        try {
            const dataToSave = {
                ...data,
                id: data.id || crypto.randomUUID(),
                additionalFields: JSON.stringify(additionalFields)
            };

            if (data.id) {
                await repository.put(dataToSave);
                notify(`${resourceName} updated successfully`, 'success');
            } else {
                await repository.add(dataToSave);
                notify(`${resourceName} added successfully`, 'success');
            }

            await loadItems();
            return { success: true };
        } catch (error) {
            console.error(`Failed to save ${resourceName}`, error);
            notify(`Failed to save ${resourceName}`, 'error');
            return { success: false, error };
        }
    };

    const remove = async (id) => {
        try {
            await repository.delete(id);
            notify(`${resourceName} deleted successfully`, 'success');
            await loadItems();
            return true;
        } catch (error) {
            console.error(`Failed to delete ${resourceName}`, error);
            notify(`Failed to delete ${resourceName}`, 'error');
            return false;
        }
    };

    return {
        items,
        loading,
        save,
        remove,
        refresh: loadItems
    };
};
