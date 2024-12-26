import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    filters: {
        priceRange: { min: 0, max: 10000 },
        brands: [],
        scale: [],
        sortBy: "default",
        searchText:''
    }
}

const filterSlice = createSlice({
    name:'filter',
    initialState,
    reducers:{
        setPriceRange:((state,action)=>{
            state.filters.priceRange = action.payload;
        }),
        setBrands:((state,action)=>{
            state.filters.brands = action.payload;
        }),
        setScale:((state,action)=>{
            state.filters.scale = action.payload;
        }),
        setSortBy:((state,action)=>{
            state.filters.sortBy = action.payload;
        }),
        setSearchText:((state,action)=>{
            state.filters.searchText = action.payload;
        })
    },

});

export const {setPriceRange,setBrands,setScale,setSortBy,setSearchText} = filterSlice.actions;
export default filterSlice.reducer