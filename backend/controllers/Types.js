const Types=require('../models/Types');



exports.getTypes = async (req, res) => {
    try {
      const Type = await Types.find();
      res.json(Type); 
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch Types' });
    }
  };


  exports.createTypes = async (req, res) => {
    const { TypesTitle,TypesIcon} = req.body;
  
    try {
     
      const newType = new Types({
        TypesTitle: TypesTitle,
        TypesIcon: TypesIcon,
       
      });
  
      const savedType = await newType.save();
  
      const Type = await Types.find();

      
  
      res.status(201).json(Type);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Error creating post' });
    }
  };
