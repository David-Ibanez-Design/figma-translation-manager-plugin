import React, {useState, useEffect, useRef} from "react";
import InfiniteScroll from 'react-infinite-scroll-component';
import PropTypes from 'prop-types';
import styles from './selectFromDictionaries.modules.scss'
import AddNew from '../addNew/addNew'
import classNames from 'classNames'
import { TRANS_SEPARATOR, TRANS_IDENTIFIER, LANG } from '../globalConst'
import t from '../applicationTranslations'

const SelectFromDictionaries = ({className, isProcessing, dictionaries, setIsActive, selectedLayers, dictionaryTermTrigger, SetSelectedLayers }) =>  {
  let dictionaryContent = {};
  let dictionaryList = dictionaries;
  const searchRef = useRef(null);
  const itemToDisplay = 99;

  useEffect(() => {
    searchRef.current.focus();
  }, [searchRef]);
    for (const dictionary in dictionaryList) {
      for (const key in dictionaryList[dictionary]) {
        dictionaryContent[key] = {
            'dictionary': dictionary,
            'translation': dictionaryList[dictionary][key],
        };
      }
    }

    const [filteredList, setFilteredList] = useState(Object.entries(dictionaryContent));
    const [itemCount, setItemCount] = useState(itemToDisplay);
    const [filterCategory, setFilterCategory] = useState("All"); 
    const [searchQuery, setSearchQuery] = useState(); 
    const [checked, setChecked] = useState(false); 
    const [showAddNew, setShowAddNew] = useState(false);
    const [selectedValuesOnChange, setSelectedValuesOnChange] = useState({
      "item":"",
       "dictionaryName":"",
       "translation":"",
       "status":""
    });



    const filterBySearch = (event, filterCategory) => {

      const query = event.target.value.trim();

      setSearchQuery(query);

      let updatedList = Object.entries(dictionaryContent).filter(([key, value]) => {

        if (filterCategory !== 'All' && value.dictionary === filterCategory) {
          return key.toLowerCase().includes(query.toLowerCase());
        }

        if (filterCategory === 'All'){
          return key.toLowerCase().includes(query.toLowerCase());
        }

      })

      setFilteredList(updatedList);

    };
    
    
    
    const filterBySelection = (event) => {
      const query = event.target.value;

      setFilterCategory(query);

      let updatedList =  Object.entries(dictionaryContent).filter(([key, value]) => {
        if (query === 'All') {
           return dictionaryContent;
        }else{
            if(searchQuery){
              return searchQuery && key.toLowerCase().includes(searchQuery.toLowerCase())
            }
            return value.dictionary === query;
        }
      });

      setFilteredList(updatedList)
    
    }
    

    const handleSaveClick = () =>{

      dictionaryTermTrigger(true);
      isProcessing(true);

      // Here we are passing values saved in selectedValuesOnChange because we also
      // Need to update when the a new term is selected but the translation is unchanged
      SetSelectedLayers(prevState => ({
        ...prevState,
          item: selectedValuesOnChange.item,
          layerName: selectedValuesOnChange.layerName,
          dictionaryName: selectedValuesOnChange.dictionaryName,
          translation: selectedValuesOnChange.translation,
          status: selectedValuesOnChange.status
      }));
    }

    const handleChange = (item, dictionaryName, translation) => {  
 
      setSelectedValuesOnChange(prevState => ({
        ...prevState,
          item: item,
          dictionaryName: dictionaryName,
          layerName: TRANS_IDENTIFIER + dictionaryName + TRANS_SEPARATOR + item,
          translation: translation,
          status: dictionaryName + TRANS_SEPARATOR + item

      }));
      setChecked(true);
  }; 

  const handleAddNew = () => {
    setShowAddNew(true)
  }

  const handleCancel = () => {
    setIsActive(false);
  }
 
    return (
      <>
        {showAddNew &&  

          <AddNew 
            setShowAddNew={setShowAddNew} 
            // passing this instead of the function because in the level up is it assigned a function
            // Not great and hard to understand so this need to be updated
            setStatusFromAddNew={dictionaryTermTrigger}
            selectedLayers={selectedLayers}
            isProcessing={isProcessing}
          />}
        {
          !showAddNew &&
          <div className={classNames(className, styles.textList, "w-100")}>
            <h1 className="fs-4 py-2 px-3 mb-0">{t.select_or[LANG]} <a href='#' onClick={handleAddNew}>{t.add[LANG]}</a></h1>
            <div className="py-2 px-3 d-flex">
              <input 
                id="search-box"  
                className={classNames(styles.search, "w-100 mr-2")} 
                onChange={() => filterBySearch(event, filterCategory)} 
                placeholder={t.search_dictionary[LANG]}
                ref={searchRef}
              />
              <select 
                id="dictionaries" 
                name="Dictionaries"
                onChange={filterBySelection}
              >
                <option value="All" className={styles.placeholder} selected="selected">{t.all[LANG]}</option>
                {Object.keys(dictionaryList).map((item, index) => (
                  <option key={index}  value={item}>{item}</option>
                ))}
              </select>
            </div>
            <form className='py-2 px-3'>
              <InfiniteScroll
                  dataLength={itemCount}
                  next={() => { setItemCount(prevItemCount => prevItemCount + itemToDisplay);}}
                  hasMore={itemCount < Object.keys(filteredList).length} 
                  height={403}
                >
                <fieldset>
                  {filteredList.length > 0 && filteredList.slice(0, itemCount).map(([item, value], index) => (
                    <label 
                      onChange={() => handleChange(item, value.dictionary, value.translation)}
                      key={index} 
                      className="d-flex align-items-center text-truncate"
                      >
                        <input 
                          type="radio" 
                          id={index} 
                          name="selector"
                        />
                        <div className="text-truncate">
                          <div className={classNames("ml-2 text-truncate", styles.termValue)}>
                            {item}
                          </div>
                          <div className={classNames("ml-2 text-truncate fs-7", styles.termValue)}>
                            {value.translation}
                          </div>
                          <div className={classNames("ml-2 text-truncate", styles.dictionaryName)}>
                            {value.dictionary}
                          </div>
                        </div>
                    </label>
                  ))}
                </fieldset>
              </InfiniteScroll>
            </form>
            <div className="action-bar">
              <button className={classNames(
                      "button theme-primary mr-2 size-small", {
                      "disabled" :  !checked,
                  })}
                onClick={selectedLayers && handleSaveClick} 
                  >
                    {t.apply[LANG]}
              </button>
              <button 
                className="button theme-secondary size-small" 
                onClick={handleCancel} >
                  {t.cancel[LANG]} 
                </button>
            </div>
          </div>
        }

      </>
    )
}

SelectFromDictionaries.propTypes = {
  className: PropTypes.string,
};

export default SelectFromDictionaries;